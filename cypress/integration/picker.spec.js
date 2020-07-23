import { getPickerInstanceFromWindow } from './utils.js';

context('Basic Usage', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.get('#input1').as('inputFocus');
    cy.get('#input2').as('inputTrigger');
    cy.get('#link').as('triggerElement');
  });

  it('Open on focus', () => {
    getPickerInstanceFromWindow().then((instance) => {
      cy.get('@inputFocus').focus();
      cy.get(instance.container).should('be.visible');
    });
  });

  it('Open on click', () => {
    getPickerInstanceFromWindow('triggerPicker').then((instance) => {
      cy.get('@triggerElement').click();
      cy.get(instance.container).should('be.visible');
    });
  });

  it('Show programatically', () => {
    getPickerInstanceFromWindow('triggerPicker').then((instance) => {
      instance.show();
      cy.get(instance.container).should('be.visible');
    });
  });

  it('Hide programatically', () => {
    getPickerInstanceFromWindow('triggerPicker').then((instance) => {
      cy.get('@triggerElement').click();
      cy.get(instance.container)
        .should('be.visible')
        .then(() => {
          instance.hide();
          cy.get(instance.container).should('not.be.visible');
        });
    });
  });

  it('Hide when click outside', () => {
    getPickerInstanceFromWindow('triggerPicker').then((instance) => {
      cy.get('@triggerElement').click();
      cy.get(instance.container)
        .should('be.visible')
        .then(() => {
          cy.root().click();
          cy.get(instance.container).should('not.be.visible');
        });
    });
  });

  it('Set time properly', () => {
    getPickerInstanceFromWindow().then((instance) => {
      const chosen = { h: '10', m: '30' };

      cy.get('@inputFocus').focus();
      cy.get(instance.container).within(() => {
        cy.get(`[data-hour="${chosen.h}"]`)
          .click()
          .invoke('attr', 'class')
          .should('contain', 'selected');

        cy.get(instance.container).should('be.visible');

        cy.get(`[data-minute="${chosen.m}"]`)
          .click()
          .invoke('attr', 'class')
          .should('contain', 'selected');

        cy.get(instance.container).should('not.be.visible');
        cy.get('@inputFocus').should('have.value', Object.values(chosen).join(':'));
      });
    });
  });
});
