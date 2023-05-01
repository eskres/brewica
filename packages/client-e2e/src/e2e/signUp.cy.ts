import {faker} from '@faker-js/faker'

const username = faker.internet.userName();
const email = faker.internet.email();
const password = faker.internet.password();

describe('sign up', () => {
  it('user should be able to sign up', () => {
    cy.visit('http://localhost:4200')

    cy.get('button').contains('Sign Up').click()

    cy.get('input[type="username"]').type(username)
    cy.get('input[type="email"]').type(email)
    cy.get('input[type="password"]').type(password)
    cy.get('input[type="passwordConfirm"]').type(password)

    cy.get('button').contains('Submit').click()
  });
});