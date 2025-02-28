const login = require("../fixtures/login");
const selectors = require("../fixtures/selectors");
const tests = require("../fixtures/seats");
const valid = login.valid;
const invalid = login.invalid;

describe("Working with the user interface", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Should show correct number of days", () => {
    cy.get(selectors.daysWeek).should("have.length", 7);
  });

  tests.forEach((test) => {
    it(test.name, () => {
      cy.get(selectors.pageNav).click();
      cy.get(selectors.movie).first().contains("12:00").click();
      test.data.forEach((seat) => {
        cy.get(
          `${selectors.buyingScheme}  
           ${selectors.child}(${seat.row})  
           ${selectors.child}(${seat.seat})`
        ).click();
      });

      cy.get(selectors.acceptinButton).click();
      cy.contains(selectors.messageAboutSelectedTickets).should("be.visible");
    });
  });

  it("Try to book a reserved seat", () => {
    cy.get(selectors.pageNav).click();
    cy.get(selectors.movie).first().contains("12:00").click();
    cy.get(`${selectors.child2}(5) > ${selectors.child2}(8)`).click();
    cy.get(selectors.acceptinButton).should("be.disabled");
  });
});

describe("Login to admin page", () => {
  beforeEach(() => {
    cy.visit("/admin/");
  });

  it("Successful authorization", () => {
    cy.fixture("login").then(() => {
      cy.login(valid.username, valid.password);
    });
    cy.contains(selectors.successfulAuthorization).should("be.visible");
  });

  it("Invalid email", () => {
    cy.fixture("login").then(() => {
      cy.login(invalid.username, invalid.password);
    });
    cy.contains(selectors.errorMessage).should("be.visible");
  });

  it("Getting a movie from the admin panel", () => {
    cy.fixture("login").then(() => {
      cy.login(valid.username, valid.password);
    });
    cy.get(selectors.getMovie)
      .then(($el) => $el.textContent)
      .should("have.text", "Унесенные ветром.");
    cy.get(selectors.getMovie)
      .invoke("text")
      .then((text) => {
        cy.visit("/");
        cy.wait(1000);
        cy.get(selectors.pageNav).click();
        cy.get(selectors.getTitle).contains(text)
          .then(() => {
            cy.get(
              `${selectors.child2}(3) > ${selectors.getTime}`).click();
            cy.get(`${selectors.child2}(3) > ${selectors.child2}(7)`).click();
            cy.get(selectors.acceptinButton).click();
            cy.contains(selectors.messageAboutSelectedTickets).should("be.visible");
          });
      });
  });
});
