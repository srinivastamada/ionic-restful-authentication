"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Original Source - https://github.com/babel/babel/blob/master/packages/babel-traverse/src/scope/lib/renamer.js
 *
 * This one modifies it for one scenario -
 * check the parent of a ReferencedIdentifier and don't rename Labels
 *
 */
var t = require("babel-types");

var renameVisitor = {
  "ReferencedIdentifier|BindingIdentifier": function ReferencedIdentifierBindingIdentifier(path, state) {
    var node = path.node;

    if (path.parentPath.isLabeledStatement({ label: node }) || path.parentPath.isBreakStatement({ label: node }) || path.parentPath.isContinueStatement({ label: node })) {
      return;
    }
    if (node.name === state.oldName) {
      node.name = state.newName;
    }
  },
  Scope: function Scope(path, state) {
    if (!path.scope.bindingIdentifierEquals(state.oldName, state.binding.identifier)) {
      path.skip();
    }
  },
  "AssignmentExpression|Declaration": function AssignmentExpressionDeclaration(path, state) {
    var ids = path.getOuterBindingIdentifiers();

    for (var name in ids) {
      if (name === state.oldName) ids[name].name = state.newName;
    }
  }
};

module.exports = function () {
  function Renamer(binding, oldName, newName) {
    _classCallCheck(this, Renamer);

    this.newName = newName;
    this.oldName = oldName;
    this.binding = binding;
  }

  _createClass(Renamer, [{
    key: "maybeConvertFromExportDeclaration",
    value: function maybeConvertFromExportDeclaration(parentDeclar) {
      var exportDeclar = parentDeclar.parentPath.isExportDeclaration() && parentDeclar.parentPath;
      if (!exportDeclar) return;

      // build specifiers that point back to this export declaration
      var isDefault = exportDeclar.isExportDefaultDeclaration();

      if (isDefault && (parentDeclar.isFunctionDeclaration() || parentDeclar.isClassDeclaration()) && !parentDeclar.node.id) {
        // Ensure that default class and function exports have a name so they have a identifier to
        // reference from the export specifier list.
        parentDeclar.node.id = parentDeclar.scope.generateUidIdentifier("default");
      }

      var bindingIdentifiers = parentDeclar.getOuterBindingIdentifiers();
      var specifiers = [];

      for (var name in bindingIdentifiers) {
        var localName = name === this.oldName ? this.newName : name;
        var exportedName = isDefault ? "default" : name;
        specifiers.push(t.exportSpecifier(t.identifier(localName), t.identifier(exportedName)));
      }

      var aliasDeclar = t.exportNamedDeclaration(null, specifiers);

      // hoist to the top if it's a function
      if (parentDeclar.isFunctionDeclaration()) {
        aliasDeclar._blockHoist = 3;
      }

      exportDeclar.insertAfter(aliasDeclar);
      exportDeclar.replaceWith(parentDeclar.node);
    }
  }, {
    key: "maybeConvertFromClassFunctionDeclaration",
    value: function maybeConvertFromClassFunctionDeclaration(path) {
      return; // TODO

      // retain the `name` of a class/function declaration

      if (!path.isFunctionDeclaration() && !path.isClassDeclaration()) return;
      if (this.binding.kind !== "hoisted") return;

      path.node.id = t.identifier(this.oldName);
      path.node._blockHoist = 3;

      path.replaceWith(t.variableDeclaration("let", [t.variableDeclarator(t.identifier(this.newName), t.toExpression(path.node))]));
    }
  }, {
    key: "maybeConvertFromClassFunctionExpression",
    value: function maybeConvertFromClassFunctionExpression(path) {
      return; // TODO

      // retain the `name` of a class/function expression

      if (!path.isFunctionExpression() && !path.isClassExpression()) return;
      if (this.binding.kind !== "local") return;

      path.node.id = t.identifier(this.oldName);

      this.binding.scope.parent.push({
        id: t.identifier(this.newName)
      });

      path.replaceWith(t.assignmentExpression("=", t.identifier(this.newName), path.node));
    }
  }, {
    key: "rename",
    value: function rename(block) {
      var binding = this.binding;
      var oldName = this.oldName;
      var newName = this.newName;
      var scope = binding.scope;
      var path = binding.path;


      var parentDeclar = path.find(function (path) {
        return path.isDeclaration() || path.isFunctionExpression();
      });
      if (parentDeclar) {
        this.maybeConvertFromExportDeclaration(parentDeclar);
      }

      scope.traverse(block || scope.block, renameVisitor, this);

      if (!block) {
        scope.removeOwnBinding(oldName);
        scope.bindings[newName] = binding;
        this.binding.identifier.name = newName;
      }

      if (binding.type === "hoisted") {
        // https://github.com/babel/babel/issues/2435
        // todo: hoist and convert function to a let
      }

      if (parentDeclar) {
        this.maybeConvertFromClassFunctionDeclaration(parentDeclar);
        this.maybeConvertFromClassFunctionExpression(parentDeclar);
      }
    }
  }]);

  return Renamer;
}();