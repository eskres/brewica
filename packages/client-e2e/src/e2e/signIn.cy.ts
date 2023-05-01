describe('sign up', () => {
  it('user should be able to sign in', () => {
    cy.visit('http://localhost:4200')

    cy.get('button').contains('Sign In').click()

    cy.get('input[type="email"]').type('test@test.com')
    cy.get('input[type="password"]').type('test123')

    cy.get('button').contains('Submit').click()
  });
});