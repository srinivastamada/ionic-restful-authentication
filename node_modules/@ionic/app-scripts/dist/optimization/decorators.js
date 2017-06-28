"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var typescript_1 = require("typescript");
var logger_1 = require("../logger/logger");
var Constants = require("../util/constants");
var helpers_1 = require("../util/helpers");
var typescript_utils_1 = require("../util/typescript-utils");
function addPureAnnotation(filePath, originalFileContent, magicString) {
    logger_1.Logger.debug("[decorators] addPureAnnotation: processing " + filePath + " ...");
    var typescriptFile = typescript_utils_1.getTypescriptSourceFile(filePath, originalFileContent);
    var parenthesizedExpressions = typescript_utils_1.findNodes(typescriptFile, typescriptFile, typescript_1.SyntaxKind.ParenthesizedExpression, false);
    parenthesizedExpressions.forEach(function (parenthesizedExpression) {
        if (parenthesizedExpression.expression && parenthesizedExpression.expression.kind === typescript_1.SyntaxKind.CallExpression
            && parenthesizedExpression.expression.expression
            && parenthesizedExpression.expression.expression.kind === typescript_1.SyntaxKind.FunctionExpression
            && !parenthesizedExpression.expression.expression.name
            && parenthesizedExpression.expression.expression.parameters) {
            // it's an iffe
            if (parenthesizedExpression.expression.expression.parameters.length === 0) {
                magicString.prependLeft(parenthesizedExpression.pos, exports.PURE_ANNOTATION);
            }
            else if (parenthesizedExpression.expression.expression.parameters[0]
                && parenthesizedExpression.expression.expression.parameters[0].name
                && parenthesizedExpression.expression.expression.parameters[0].name.text === '_super') {
                magicString.prependLeft(parenthesizedExpression.pos, exports.PURE_ANNOTATION);
            }
        }
    });
    return magicString;
}
exports.addPureAnnotation = addPureAnnotation;
function purgeTranspiledDecorators(filePath, originalFileContent, magicString) {
    if (helpers_1.isSrcOrIonicOrIonicDeps(filePath)) {
        logger_1.Logger.debug("[decorators] purgeTranspiledDecorators: processing " + filePath + " ...");
        var typescriptFile = typescript_utils_1.getTypescriptSourceFile(filePath, originalFileContent);
        var expressionsToRemove = getTranspiledDecoratorExpressionStatements(typescriptFile);
        expressionsToRemove.forEach(function (expression) {
            magicString.overwrite(expression.pos, expression.end, '');
        });
        logger_1.Logger.debug("[decorators] purgeTranspiledDecorators: processing " + filePath + " ...");
    }
    return magicString;
}
exports.purgeTranspiledDecorators = purgeTranspiledDecorators;
function getTranspiledDecoratorExpressionStatements(sourceFile) {
    var expressionStatements = typescript_utils_1.findNodes(sourceFile, sourceFile, typescript_1.SyntaxKind.ExpressionStatement, false);
    var toReturn = [];
    expressionStatements.forEach(function (expressionStatement) {
        if (expressionStatement && expressionStatement.expression
            && expressionStatement.expression.kind === typescript_1.SyntaxKind.CallExpression
            && expressionStatement.expression.expression
            && expressionStatement.expression.expression.text === '___decorate'
            && expressionStatement.expression.arguments
            && expressionStatement.expression.arguments.length > 0
            && expressionStatement.expression.arguments[0].kind === typescript_1.SyntaxKind.ArrayLiteralExpression
            && expressionStatement.expression.arguments[0].elements
            && expressionStatement.expression.arguments[0].elements.length > 0
            && expressionStatement.expression.arguments[0].elements[0].expression
            && expressionStatement.expression.arguments[0].elements[0].expression.kind === typescript_1.SyntaxKind.Identifier
            && canRemoveDecoratorNode(expressionStatement.expression.arguments[0].elements[0].expression.text)) {
            toReturn.push(expressionStatement);
        }
        else if (expressionStatement && expressionStatement.expression
            && expressionStatement.expression.kind === typescript_1.SyntaxKind.BinaryExpression
            && expressionStatement.expression.right
            && expressionStatement.expression.right.kind === typescript_1.SyntaxKind.CallExpression
            && expressionStatement.expression.right.expression
            && expressionStatement.expression.right.expression.text === '___decorate'
            && expressionStatement.expression.right.arguments
            && expressionStatement.expression.right.arguments.length > 0
            && expressionStatement.expression.right.arguments[0].kind === typescript_1.SyntaxKind.ArrayLiteralExpression
            && expressionStatement.expression.right.arguments[0].elements
            && expressionStatement.expression.right.arguments[0].elements.length > 0) {
            var immovableDecoratorFound = false;
            // remove the last item in the array as it is always __metadata() and should not be considered here
            var numElements = expressionStatement.expression.right.arguments[0].elements.length - 1;
            var elementsToEvaluate = expressionStatement.expression.right.arguments[0].elements.slice(0, numElements);
            for (var _i = 0, elementsToEvaluate_1 = elementsToEvaluate; _i < elementsToEvaluate_1.length; _i++) {
                var element = elementsToEvaluate_1[_i];
                if (element.kind === typescript_1.SyntaxKind.CallExpression && element.expression
                    && !canRemoveDecoratorNode(element.expression.text)) {
                    immovableDecoratorFound = true;
                    break;
                }
            }
            if (!immovableDecoratorFound) {
                toReturn.push(expressionStatement);
            }
        }
    });
    return toReturn;
}
function purgeStaticFieldDecorators(filePath, originalFileContent, magicString) {
    if (helpers_1.isSrcOrIonicOrIonicDeps(filePath)) {
        logger_1.Logger.debug("[decorators] purgeStaticFieldDecorators: processing " + filePath + " ...");
        var typescriptFile = typescript_utils_1.getTypescriptSourceFile(filePath, originalFileContent);
        var decoratorExpressionStatements = getDecoratorsExpressionStatements(typescriptFile);
        removeDecorators(decoratorExpressionStatements, magicString);
        var propDecoratorsExpressionStatements = getPropDecoratorsExpressionStatements(typescriptFile);
        removePropDecorators(propDecoratorsExpressionStatements, magicString);
        logger_1.Logger.debug("[decorators] purgeStaticFieldDecorators: processing " + filePath + " ... DONE");
    }
    return magicString;
}
exports.purgeStaticFieldDecorators = purgeStaticFieldDecorators;
function purgeStaticCtorFields(filePath, originalFileContent, magicString) {
    // TODO - we could extend this to other libs and stuff too such as material 2, but that doesn't seem
    // particularly maintainable
    if (helpers_1.isIonic(filePath) && !isIonicEntryComponent(filePath)) {
        logger_1.Logger.debug("[decorators] purgeStaticCtorFields: processing " + filePath + " ...");
        var typescriptFile = typescript_utils_1.getTypescriptSourceFile(filePath, originalFileContent);
        var expressionStatements = typescript_utils_1.findNodes(typescriptFile, typescriptFile, typescript_1.SyntaxKind.ExpressionStatement, false);
        var toPurge = [];
        for (var _i = 0, expressionStatements_1 = expressionStatements; _i < expressionStatements_1.length; _i++) {
            var expressionStatement = expressionStatements_1[_i];
            if (expressionStatement.expression && expressionStatement.expression.kind === typescript_1.SyntaxKind.BinaryExpression
                && expressionStatement.expression.left
                && expressionStatement.expression.left.kind === typescript_1.SyntaxKind.PropertyAccessExpression
                && expressionStatement.expression.left.name
                && expressionStatement.expression.left.name.text === 'ctorParameters') {
                toPurge.push(expressionStatement);
            }
        }
        toPurge.forEach(function (tsNode) {
            magicString.overwrite(tsNode.pos, tsNode.end, '');
        });
        logger_1.Logger.debug("[decorators] purgeStaticFieldDecorators: processing " + filePath + " ... DONE");
    }
    return magicString;
}
exports.purgeStaticCtorFields = purgeStaticCtorFields;
function isIonicEntryComponent(filePath) {
    if (filePath === helpers_1.getStringPropertyValue(Constants.ENV_ACTION_SHEET_COMPONENT_PATH)) {
        return true;
    }
    else if (filePath === helpers_1.getStringPropertyValue(Constants.ENV_ALERT_COMPONENT_PATH)) {
        return true;
    }
    else if (filePath === helpers_1.getStringPropertyValue(Constants.ENV_APP_ROOT_COMPONENT_PATH)) {
        return true;
    }
    else if (filePath === helpers_1.getStringPropertyValue(Constants.ENV_LOADING_COMPONENT_PATH)) {
        return true;
    }
    else if (filePath === helpers_1.getStringPropertyValue(Constants.ENV_MODAL_COMPONENT_PATH)) {
        return true;
    }
    else if (filePath === helpers_1.getStringPropertyValue(Constants.ENV_PICKER_COMPONENT_PATH)) {
        return true;
    }
    else if (filePath === helpers_1.getStringPropertyValue(Constants.ENV_POPOVER_COMPONENT_PATH)) {
        return true;
    }
    else if (filePath === helpers_1.getStringPropertyValue(Constants.ENV_TOAST_COMPONENT_PATH)) {
        return true;
    }
    return false;
}
function getDecoratorsExpressionStatements(typescriptFile) {
    var expressionStatements = typescript_utils_1.findNodes(typescriptFile, typescriptFile, typescript_1.SyntaxKind.ExpressionStatement, false);
    var decoratorExpressionStatements = [];
    for (var _i = 0, expressionStatements_2 = expressionStatements; _i < expressionStatements_2.length; _i++) {
        var expressionStatement = expressionStatements_2[_i];
        if (expressionStatement.expression && expressionStatement.expression.left
            && expressionStatement.expression.left.name
            && expressionStatement.expression.left.name.text === 'decorators') {
            decoratorExpressionStatements.push(expressionStatement);
        }
    }
    return decoratorExpressionStatements;
}
function getPropDecoratorsExpressionStatements(typescriptFile) {
    var expressionStatements = typescript_utils_1.findNodes(typescriptFile, typescriptFile, typescript_1.SyntaxKind.ExpressionStatement, false);
    var decoratorExpressionStatements = [];
    for (var _i = 0, expressionStatements_3 = expressionStatements; _i < expressionStatements_3.length; _i++) {
        var expressionStatement = expressionStatements_3[_i];
        if (expressionStatement.expression && expressionStatement.expression.left && expressionStatement.expression.left.name && expressionStatement.expression.left.name.text === 'propDecorators') {
            decoratorExpressionStatements.push(expressionStatement);
        }
    }
    return decoratorExpressionStatements;
}
function removeDecorators(decoratorExpressionStatements, magicString) {
    decoratorExpressionStatements.forEach(function (expressionStatement) {
        if (expressionStatement.expression && expressionStatement.expression.right && expressionStatement.expression.right.elements) {
            var numPotentialNodesToRemove = expressionStatement.expression.right.elements.length;
            var objectLiteralsToPurge_1 = [];
            expressionStatement.expression.right.elements.forEach(function (objectLiteral) {
                if (objectLiteral.properties && objectLiteral.properties.length > 1) {
                    if (objectLiteral.properties[0].name && objectLiteral.properties[0].name.text === 'type'
                        && canRemoveDecoratorNode(objectLiteral.properties[0].initializer.text)) {
                        // sweet, we can remove the object literal
                        objectLiteralsToPurge_1.push(objectLiteral);
                    }
                }
            });
            if (objectLiteralsToPurge_1.length === numPotentialNodesToRemove) {
                // we are removing all decorators, so just remove the entire expression node
                magicString.overwrite(expressionStatement.pos, expressionStatement.end, '');
            }
            else {
                // we are removing a subset of decorators, so remove the individual object literal findNodes
                objectLiteralsToPurge_1.forEach(function (objectLiteralToPurge) {
                    magicString.overwrite(objectLiteralToPurge.pos, objectLiteralToPurge.end, '');
                });
            }
        }
    });
}
function removePropDecorators(propDecoratorExpressionStatements, magicString) {
    propDecoratorExpressionStatements.forEach(function (expressionStatement) {
        magicString.overwrite(expressionStatement.pos, expressionStatement.end, '');
    });
}
function canRemoveDecoratorNode(decoratorType) {
    if (decoratorType === exports.COMPONENT) {
        return true;
    }
    else if (decoratorType === exports.CONTENT_CHILD_DECORATOR) {
        return true;
    }
    else if (decoratorType === exports.CONTENT_CHILDREN_DECORATOR) {
        return true;
    }
    else if (decoratorType === exports.DIRECTIVE_DECORATOR) {
        return true;
    }
    else if (decoratorType === exports.HOST_DECORATOR) {
        return true;
    }
    else if (decoratorType === exports.HOST_BINDING_DECORATOR) {
        return true;
    }
    else if (decoratorType === exports.HOST_LISTENER_DECORATOR) {
        return true;
    }
    else if (decoratorType === exports.INPUT_DECORATOR) {
        return true;
    }
    else if (decoratorType === exports.NG_MODULE_DECORATOR) {
        return true;
    }
    else if (decoratorType === exports.OUTPUT_DECORATOR) {
        return true;
    }
    else if (decoratorType === exports.PIPE_DECORATOR) {
        return true;
    }
    else if (decoratorType === exports.VIEW_CHILD_DECORATOR) {
        return true;
    }
    else if (decoratorType === exports.VIEW_CHILDREN_DECORATOR) {
        return true;
    }
    else if (decoratorType === exports.IONIC_PAGE_DECORATOR) {
        return true;
    }
    return false;
}
exports.COMPONENT = 'Component';
exports.CONTENT_CHILD_DECORATOR = 'ContentChild';
exports.CONTENT_CHILDREN_DECORATOR = 'ContentChildren';
exports.DIRECTIVE_DECORATOR = 'Directive';
exports.HOST_DECORATOR = 'Host';
exports.HOST_BINDING_DECORATOR = 'HostBinding';
exports.HOST_LISTENER_DECORATOR = 'HostListener';
exports.INPUT_DECORATOR = 'Input';
exports.NG_MODULE_DECORATOR = 'NgModule';
exports.OUTPUT_DECORATOR = 'Output';
exports.PIPE_DECORATOR = 'Pipe';
exports.VIEW_CHILD_DECORATOR = 'ViewChild';
exports.VIEW_CHILDREN_DECORATOR = 'ViewChildren';
exports.IONIC_PAGE_DECORATOR = 'IonicPage';
exports.PURE_ANNOTATION = ' /*#__PURE__*/';
