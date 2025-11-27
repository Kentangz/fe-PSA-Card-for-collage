describe("Fitur Login PSA Card (Staging Mode)", () => {
	beforeEach(() => {
		cy.visit("/signin");
	});

	it("Halaman login berhasil dimuat", () => {
		cy.contains("Welcome Back").should("be.visible");
		cy.get('input[name="email"]').should("be.visible");
		cy.get('input[name="password"]').should("be.visible");
	});

	it("Gagal login dengan kredensial salah", () => {
		cy.get('input[name="email"]').type("salah@example.com");
		cy.get('input[name="password"]').type("passwordSalah123");

		cy.get('button[type="submit"]').click();
	});

	it("Berhasil login sebagai User (Lili)", () => {
		cy.get('input[name="email"]').type("lili@example.com");
		cy.get('input[name="password"]').type("123123");

		cy.get('button[type="submit"]').click();
		cy.url().should("include", "/dashboard/user");

		cy.contains("Dashboard Overview").should("be.visible");
	});

	it("Berhasil login sebagai Admin", () => {
		cy.get('input[name="email"]').type("admin@example.com");
		cy.get('input[name="password"]').type("rahasia");

		cy.get('button[type="submit"]').click();
		cy.url().should("include", "/dashboard/admin");
		cy.contains("Dashboard Overview").should("be.visible");
	});
});
