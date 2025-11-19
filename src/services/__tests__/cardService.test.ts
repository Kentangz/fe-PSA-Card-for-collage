// src/services/__tests__/cardService.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as cardService from "../cardService";
import axiosInstance from "@/lib/axiosInstance";

vi.mock("@/lib/axiosInstance");

describe("CardService - Complete Coverage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("createEntry()", () => {
		it("harus mengirim data submission dengan FormData yang benar", async () => {
			const mockBatchId = 123;
			const mockCards = [
				{
					name: "Charizard",
					year: 1999,
					brand: "Pokemon",
					serial_number: "PSA123",
					images: [
						new File(["(binary)"], "charizard.jpg", { type: "image/jpeg" }),
					],
				},
			];

			const mockResponse = {
				data: {
					entry: { id: 1 },
					cards: [{ id: 101 }],
				},
			};
			vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

			const result = await cardService.createEntry(mockBatchId, mockCards);

			const callArgs = vi.mocked(axiosInstance.post).mock.calls[0];
			const url = callArgs[0];
			const formData = callArgs[1] as FormData;
			const config = callArgs[2];

			expect(url).toBe(`/batches/${mockBatchId}/entries`);
			expect(config?.headers).toEqual({
				"Content-Type": "multipart/form-data",
			});
			expect(formData.get("cards[0][name]")).toBe("Charizard");
			expect(formData.get("cards[0][year]")).toBe("1999");
			expect(formData.get("cards[0][brand]")).toBe("Pokemon");
			expect(formData.get("cards[0][serial_number]")).toBe("PSA123");

			const imageFile = formData.get("cards[0][images][]") as File;
			expect(imageFile).toBeInstanceOf(File);
			expect(imageFile.name).toBe("charizard.jpg");
			expect(result).toEqual(mockResponse.data);
		});

		it("harus mengirim card tanpa serial_number dan images", async () => {
			const mockBatchId = 456;
			const mockCards = [
				{
					name: "Pikachu",
					year: 2000,
					brand: "Pokemon",
				},
			];

			const mockResponse = {
				data: {
					entry: { id: 2 },
					cards: [{ id: 102 }],
				},
			};
			vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

			await cardService.createEntry(mockBatchId, mockCards);

			const callArgs = vi.mocked(axiosInstance.post).mock.calls[0];
			const formData = callArgs[1] as FormData;

			expect(formData.get("cards[0][name]")).toBe("Pikachu");
			expect(formData.get("cards[0][serial_number]")).toBeNull();
		});

		it("harus mengirim multiple cards sekaligus", async () => {
			const mockBatchId = 789;
			const mockCards = [
				{
					name: "Card 1",
					year: 2020,
					brand: "Brand A",
					images: [new File(["img1"], "card1.jpg", { type: "image/jpeg" })],
				},
				{
					name: "Card 2",
					year: 2021,
					brand: "Brand B",
					serial_number: "SN123",
					images: [
						new File(["img2"], "card2.jpg", { type: "image/jpeg" }),
						new File(["img3"], "card3.jpg", { type: "image/jpeg" }),
					],
				},
			];

			const mockResponse = {
				data: {
					entry: { id: 3 },
					cards: [{ id: 201 }, { id: 202 }],
				},
			};
			vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

			await cardService.createEntry(mockBatchId, mockCards);

			const callArgs = vi.mocked(axiosInstance.post).mock.calls[0];
			const formData = callArgs[1] as FormData;

			expect(formData.get("cards[0][name]")).toBe("Card 1");
			expect(formData.get("cards[1][name]")).toBe("Card 2");
			expect(formData.get("cards[1][serial_number]")).toBe("SN123");
		});
	});
});