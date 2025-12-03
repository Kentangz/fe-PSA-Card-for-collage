describe("Fitur Login PSA Card (Staging Mode)", () => {
	beforeEach(() => {
		cy.visit("/signin");
	});

	// TC-LOGIN-001
	it("TC-LOGIN-001: Login Valid (User)", () => {
		cy.get('input[name="email"]').type("test1@example.com");
		cy.get('input[name="password"]').type("testing1");
		cy.get('button[type="submit"]').click();

		cy.url().should("include", "/dashboard/user");
		cy.contains("Dashboard Overview").should("be.visible");
	});

	// TC-LOGIN-002
	it("TC-LOGIN-002: Login Gagal (Password Salah)", () => {
		cy.get('input[name="email"]').type("test1@example.com");
		cy.get('input[name="password"]').type("passwordSalah");
		cy.get('button[type="submit"]').click();

		cy.contains(/invalid|salah|gagal/i).should("be.visible");
		cy.url().should("include", "/signin");
	});

	// TC-LOGIN-003
	it("TC-LOGIN-003: Login Gagal (Email Tidak Terdaftar)", () => {
		cy.get('input[name="email"]').type("tidakada@example.com");
		cy.get('input[name="password"]').type("sembarang");
		cy.get('button[type="submit"]').click();

		cy.contains("Invalid credentials").should("be.visible");
		cy.get('input[name="password"]').type("testing2");
		cy.get('button[type="submit"]').click();

		cy.contains(/invalid|salah|gagal/i).should("be.visible");

	});

	// TC-LOGIN-007
	it("TC-LOGIN-007: Navigasi Forgot Password", () => {
		cy.contains("Forgot the password?").click();
		cy.url().should("include", "/forgot-password");
	});

	// TC-LOGIN-008
	it("TC-LOGIN-008: Navigasi Sign Up", () => {
		cy.contains("Sign Up").click();
		cy.url().should("include", "/signup");
	});
});
