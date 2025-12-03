describe("Fitur Submission PSA Card", () => {
	beforeEach(() => {
		// Use cy.session to cache login
		cy.session("user-session", () => {
			cy.visit("/signin");
			cy.get('input[name="email"]').type("test1@example.com");
			cy.get('input[name="password"]').type("testing1");
			cy.get('button[type="submit"]').click();
			cy.url().should("include", "/dashboard/user");
			cy.contains("Dashboard Overview").should("be.visible");
		});

		cy.visit("/dashboard/user");

		cy.contains("Create Submission").first().click();
		cy.contains("Create Submission").should("be.visible");
	});

	// TC-SUB-001
	it("TC-SUB-001: Single Submission Valid", () => {
		cy.get('input[name="name"]').type("Charizard Base Set");
		cy.get('input[name="year"]').type("1999");
		cy.get('input[name="brand"]').type("Pokemon");

		// Upload image
		cy.get('input[type="file"]').selectFile(
			{
				contents: Cypress.Buffer.from("dummy image content"),
				fileName: "card.jpg",
				mimeType: "image/jpeg",
			},
			{ force: true }
		);

		cy.contains("Submit All").click();

		cy.url().should("include", "/dashboard/user");
	});

	// TC-SUB-002
	it("TC-SUB-002: Batch Submission", () => {
		// Card 1
		cy.get('input[name="name"]').type("Card 1");
		cy.get('input[name="year"]').type("2020");
		cy.get('input[name="brand"]').type("Brand A");
		cy.get('input[type="file"]').selectFile(
			{
				contents: Cypress.Buffer.from("image1"),
				fileName: "card1.jpg",
				mimeType: "image/jpeg",
			},
			{ force: true }
		);

		cy.contains("+ Add More").click();

		// Card 2
		cy.get('input[name="name"]').eq(1).type("Card 2");
		cy.get('input[name="year"]').eq(1).type("2021");
		cy.get('input[name="brand"]').eq(1).type("Brand B");

		cy.get('input[id="picture-1"]').selectFile(
			{
				contents: Cypress.Buffer.from("image2"),
				fileName: "card2.jpg",
				mimeType: "image/jpeg",
			},
			{ force: true }
		);

		cy.contains("Submit All (2)").click();
		cy.url().should("include", "/dashboard/user");
	});

	// TC-SUB-003
	it("TC-SUB-003: Validasi Field Kosong", () => {
		cy.get('input[name="name"]').type("Incomplete");
		cy.contains("Submit All").click({ force: true });

		cy.get('input[name="year"]').then(($input) => {
			const input = $input[0] as HTMLInputElement;
			cy.wrap(input.validationMessage).should("not.be.empty");
		});
	});

	// TC-SUB-004
	it("TC-SUB-004: Validasi Format Tahun", () => {
		cy.get('input[name="year"]').type("abcd");
		cy.get('input[name="year"]').should("have.value", "");
	});

	// TC-SUB-005
	it("TC-SUB-005: Validasi Minimum Gambar", () => {
		cy.get('input[name="name"]').type("No Image Card");
		cy.get('input[name="year"]').type("2022");
		cy.get('input[name="brand"]').type("Brand X");

		cy.contains("Submit All").click();
	});

	// TC-SUB-006
	it("TC-SUB-006: Validasi Ukuran File (> 5MB)", () => {
		const largeFile = Cypress.Buffer.alloc(6 * 1024 * 1024);
		const stub = cy.stub();
		cy.on("window:alert", stub);

		cy.get('input[type="file"]').selectFile(
			{
				contents: largeFile,
				fileName: "large.jpg",
				mimeType: "image/jpeg",
			},
			{ force: true }
		);

		cy.wrap(stub).should("be.calledWithMatch", /size/i);
	});

	// TC-SUB-007
	it("TC-SUB-007: Validasi Format File (.pdf)", () => {
		const stub = cy.stub();
		cy.on("window:alert", stub);

		cy.get('input[type="file"]').selectFile(
			{
				contents: Cypress.Buffer.from("pdf content"),
				fileName: "doc.pdf",
				mimeType: "application/pdf",
			},
			{ force: true }
		);

		cy.wrap(stub).should(
			"be.calledWithMatch",
			/Only JPEG, PNG, JPG, or GIF images allowed/
		);
	});

	// TC-SUB-008
	it("TC-SUB-008: Cek Batch Inactive (Race Condition)", () => {
		cy.intercept("GET", "**/api/batches/999", {
			statusCode: 200,
			body: {
				id: 999,
				batch_number: "BATCH-RACE",
				is_active: true,
				category: "PSA-USA",
				services: "Regular",
			},
		}).as("getActiveBatch");

		cy.intercept("POST", "**/api/batches/999/entries", {
			statusCode: 422,
			body: {
				message: "Selected batch is not active for submissions",
			},
		}).as("postInactiveBatch");

		cy.visit("/dashboard/user/submissions?batch_id=999");
		cy.wait("@getActiveBatch");

		cy.get('input[name="name"]').type("Late Submission Card");
		cy.get('input[name="year"]').type("2024");
		cy.get('input[name="brand"]').type("Pokemon");
		cy.get('input[type="file"]').selectFile(
			{
				contents: Cypress.Buffer.from("image"),
				fileName: "card.jpg",
				mimeType: "image/jpeg",
			},
			{ force: true }
		);

		cy.contains("Submit All").click();

		cy.wait("@postInactiveBatch");

		cy.contains("Selected batch is not active for submissions").should(
			"be.visible"
		);

		cy.url().should("include", "submissions");
	});

	// TC-SUB-009
	it("TC-SUB-009: Fungsi Camera Capture", () => {
		cy.visit("/dashboard/user", {
			onBeforeLoad(win) {
				// @ts-expect-error: Mocking navigator.mediaDevices for testing purposes
				win.navigator.mediaDevices = {
					getUserMedia: cy.stub().resolves({
						getTracks: () => [{ stop: () => {} }],
					}),
				};
			},
		});

		cy.contains("Create Submission").first().click();

		cy.contains("Take Photos").should("exist").click();
		cy.contains("Camera").should("be.visible");

		cy.get("button[title='Take Photo']").click();

		cy.get("button[title='Done']").click();

		cy.get('img[alt^="Preview"]').should("be.visible");
	});

	// TC-SUB-010
	it("TC-SUB-010: Hapus Preview Foto", () => {
		cy.get('input[type="file"]').selectFile(
			{
				contents: Cypress.Buffer.from("image"),
				fileName: "delete_me.jpg",
				mimeType: "image/jpeg",
			},
			{ force: true }
		);

		cy.get('img[alt="Preview 1"]').should("be.visible");
		cy.get("button").contains("×").click();
		cy.get('img[alt="Preview 1"]').should("not.exist");
	});
});
