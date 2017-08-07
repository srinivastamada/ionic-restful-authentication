import { ComponentFixture, async } from '@angular/core/testing';
import { TestUtils }               from '../../test';
import { Welcome }          from './welcome';

let fixture: ComponentFixture<Welcome> = null;
let instance: any = null;

describe('Pages: HelloIonic', () => {

  beforeEach(async(() => TestUtils.beforeEachCompiler([Welcome]).then(compiled => {
    fixture = compiled.fixture;
    instance = compiled.instance;
  })));

  it('should create the hello ionic page', async(() => {
    expect(instance).toBeTruthy();
  }));
});
