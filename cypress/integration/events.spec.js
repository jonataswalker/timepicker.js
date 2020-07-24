import { getPickerInstanceFromWindow } from './utils.js';

let callback = (evt) => {};

context('Events', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('#input1').as('inputFocus');
  });

  it('Listen for `open` event', () => {
    getPickerInstanceFromWindow().then((instance) => {
      const callbackSpy = cy.spy(callback);

      instance.on('open', callbackSpy);
      cy.get('@inputFocus')
        .focus()
        .then(() => expect(callbackSpy).to.be.calledOnce);
    });
  });

  it('Listen for `close` event', () => {
    getPickerInstanceFromWindow().then((instance) => {
      const callbackSpy = cy.spy(callback);

      instance.on('close', callbackSpy);
      cy.get('@inputFocus')
        .focus()
        .then(() => cy.root().click())
        .then(() => expect(callbackSpy).to.be.calledOnce);
    });
  });

  it('Listen for `change` event', () => {
    getPickerInstanceFromWindow().then((instance) => {
      const chosen = { h: '10', m: '30' };

      callback = (evt) => evt.hour === chosen.h && evt.minute === chosen.m;

      const callbackSpy = cy.spy(callback);

      instance.on('change', callbackSpy);
      cy.get('@inputFocus').focus();
      cy.get(instance.container)
        .within(() => {
          cy.get(`[data-hour="${chosen.h}"]`)
            .click()
            .invoke('attr', 'class')
            .should('contain', 'selected');

          cy.get(`[data-minute="${chosen.m}"]`)
            .click()
            .invoke('attr', 'class')
            .should('contain', 'selected');
        })
        .then(() => {
          expect(callbackSpy).to.be.calledTwice;
          expect(callbackSpy).to.have.returned(true);
        });
    });
  });
});
