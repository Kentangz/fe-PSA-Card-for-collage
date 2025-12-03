describe("Fitur Register PSA Card", () => {
	beforeEach(() => {
		cy.visit("/signup");
	});

	// TC-REGISTER-001
	it("TC-REGISTER-001: Registrasi Valid", () => {
		const uniqueEmail = `new${Date.now()}@example.com`;
		const uniquePhone = `+628${Date.now()}`;

		cy.get('input[name="name"]').type("Test User");
		cy.get('input[name="email"]').type(uniqueEmail);
		cy.get('input[name="phone_number"]').clear().type(uniquePhone);
		cy.get('input[name="password"]').type("testing");
		cy.get('input[name="password_confirmation"]').type("testing");

		cy.get('button[type="submit"]').click();

		cy.url().should("include", "/signin");
	});

	// TC-REGISTER-002
	it("TC-REGISTER-002: Validasi Input Kosong", () => {
		cy.get('button[type="submit"]').click();

		cy.get('input[name="name"]').then(($input) => {
			const input = $input[0] as HTMLInputElement;
			cy.wrap(input.validationMessage).should("not.be.empty");
		});
	});

	// TC-REGISTER-003
	it("TC-REGISTER-003: Validasi Format Email", () => {
		cy.get('input[name="email"]').type("invalid-email");
		cy.get('button[type="submit"]').click();

		cy.get('input[name="email"]').then(($input) => {
			const input = $input[0] as HTMLInputElement;
			cy.wrap(input.validationMessage).should("not.be.empty");
		});
	});

	// TC-REGISTER-004
	it("TC-REGISTER-004: Duplikasi Email", () => {
		cy.get('input[name="name"]').type("Test User");
		cy.get('input[name="email"]').type("test1@example.com");
		cy.get('input[name="phone_number"]').clear().type("+628123456789");
		cy.get('input[name="password"]').type("testing");
		cy.get('input[name="password_confirmation"]').type("testing");

		cy.get('button[type="submit"]').click();

		cy.contains(/email.*taken|sudah terdaftar/i).should("be.visible");
	});

	// TC-REGISTER-005
	it("TC-REGISTER-005: Duplikasi Nomor HP", () => {
		cy.get('input[name="name"]').type("Test User");
		cy.get('input[name="email"]').type(`new${Date.now()}@example.com`);
		cy.get('input[name="phone_number"]').clear().type("+62111111111111");
		cy.get('input[name="password"]').type("testing");
		cy.get('input[name="password_confirmation"]').type("testing");

		cy.get('button[type="submit"]').click();

		cy.contains(/phone.*taken|sudah terdaftar/i).should("be.visible");
	});

	// TC-REGISTER-006
	it("TC-REGISTER-006: Validasi Panjang Password", () => {
		cy.get('input[name="name"]').type("Test User");
		cy.get('input[name="email"]').type(`test${Date.now()}@example.com`);
		cy.get('input[name="phone_number"]').clear().type("+628123456789");
		cy.get('input[name="password"]').type("test");
		cy.get('input[name="password_confirmation"]').type("test");
		cy.get('button[type="submit"]').click();

		cy.contains("The password field must be at least 6 characters.").should( "be.visible");
	});

	// TC-REGISTER-007
	it("TC-REGISTER-007: Konfirmasi Password Tidak Cocok", () => {
		cy.get('input[name="name"]').type("Test User");
		cy.get('input[name="email"]').type(`test${Date.now()}@example.com`);
		cy.get('input[name="phone_number"]').clear().type("+628123456789");
		cy.get('input[name="password"]').type("testing");
		cy.get('input[name="password_confirmation"]').type("test");
		cy.get('button[type="submit"]').click();

		cy.contains(/password.*match|tidak sama/i).should("be.visible");
	});

	// TC-REGISTER-008
	it("TC-REGISTER-008: Validasi Panjang Nomor HP", () => {
		cy.get('input[name="name"]').type("Test User");
		cy.get('input[name="email"]').type(`test${Date.now()}@example.com`);
		cy.get('input[name="phone_number"]').clear().type("+62123");
		cy.get('input[name="password"]').type("testing");
		cy.get('input[name="password_confirmation"]').type("testing");

		cy.get('button[type="submit"]').click();

		cy.contains("The phone number field must be at least 8 characters.").should("be.visible");
	});

	// TC-REGISTER-009
	it("TC-REGISTER-009: Navigasi Sign In", () => {
		cy.contains("Sign In").click();
		cy.url().should("include", "/signin");
	});
});
