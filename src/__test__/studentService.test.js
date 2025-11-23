import {jest} from "@jest/globals";

// Create repository mocks before importing the service (ESM)
const mockCreateStudent = jest.fn();
const mockFindStudentById = jest.fn();
const mockDeleteStudentById = jest.fn();
const mockUpdateStudent = jest.fn();
const mockUpdateStudentScores = jest.fn();
const mockFindStudentByName = jest.fn();
const mockCountStudentsByName = jest.fn();
const mockFindStudentsByMinScore = jest.fn();

jest.unstable_mockModule("../repository/studentRepository.js", () => ({
  createStudent: mockCreateStudent,
  findStudentById: mockFindStudentById,
  deleteStudentById: mockDeleteStudentById,
  updateStudent: mockUpdateStudent,
  updateStudentScores: mockUpdateStudentScores,
  findStudentByName: mockFindStudentByName,
  countStudentsByName: mockCountStudentsByName,
  findStudentsByMinScore: mockFindStudentsByMinScore,
}));

// Dynamic import of the service after mocks
const service = await import("../service/studentService.js");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("studentService.addStudent", () => {
  test("returns false if the student already exists", async () => {
    mockFindStudentById.mockResolvedValueOnce({ _id: 1 });

    const ok = await service.addStudent({ id: 1, name: "Ann", password: "p" });

    expect(ok).toBe(false);
    expect(mockFindStudentById).toHaveBeenCalledWith(1);
    expect(mockCreateStudent).not.toHaveBeenCalled();
  });

  test("creates a new student and returns true if not found", async () => {
    mockFindStudentById.mockResolvedValueOnce(null);
    mockCreateStudent.mockResolvedValueOnce({ _id: 2 });

    const ok = await service.addStudent({ id: 2, name: "Bob", password: "secret" });

    expect(ok).toBe(true);
    expect(mockFindStudentById).toHaveBeenCalledWith(2);
    expect(mockCreateStudent).toHaveBeenCalledWith({ _id: 2, name: "Bob", password: "secret" });
  });
});

describe("studentService.findStudent", () => {
  test("removes the password and returns the found student", async () => {
    const student = { _id: 3, name: "Dan", password: "123" };
    mockFindStudentById.mockResolvedValueOnce(student);

    const res = await service.findStudent(3);

    expect(mockFindStudentById).toHaveBeenCalledWith(3);
    expect(res).toBe(student);
    expect(res.password).toBeUndefined();
  });

  test("returns null/undefined if not found", async () => {
    mockFindStudentById.mockResolvedValueOnce(null);
    const res = await service.findStudent(99);
    expect(res).toBeNull();
  });
});

describe("studentService.deleteStudent", () => {
  test("deletes and removes the password in the response", async () => {
    const student = { _id: 4, name: "Eve", password: "pw" };
    mockDeleteStudentById.mockResolvedValueOnce(student);

    const res = await service.deleteStudent(4);

    expect(mockDeleteStudentById).toHaveBeenCalledWith(4);
    expect(res).toBe(student);
    expect(res.password).toBeUndefined();
  });

  test("returns null/undefined if the record does not exist", async () => {
    mockDeleteStudentById.mockResolvedValueOnce(null);
    const res = await service.deleteStudent(404);
    expect(res).toBeNull();
  });
});

describe("studentService.updateStudent", () => {
  test("updates and hides scores in the response", async () => {
    const updated = { _id: 5, name: "Sam", scores: { math: 100 } };
    mockUpdateStudent.mockResolvedValueOnce(updated);

    const res = await service.updateStudent(5, { name: "Sam" });

    expect(mockUpdateStudent).toHaveBeenCalledWith(5, { name: "Sam" });
    expect(res).toBe(updated);
    expect(res.scores).toBeUndefined();
  });
});

describe("studentService.addScore", () => {
  test("delegates score update to the repository and returns nothing", async () => {
    mockUpdateStudentScores.mockResolvedValueOnce({ _id: 6 });

    const res = await service.addScore(6, "math", 90);

    expect(mockUpdateStudentScores).toHaveBeenCalledWith(6, "math", 90);
    expect(res).toBeUndefined();
  });
});

describe("studentService.findByName", () => {
  test("returns an array of students without a password", async () => {
    const list = [
      { _id: 7, name: "Leo", password: "a" },
      { _id: 8, name: "Leo", password: "b" },
    ];
    mockFindStudentByName.mockResolvedValueOnce(list);

    const res = await service.findByName("Leo");

    expect(mockFindStudentByName).toHaveBeenCalledWith("Leo");
    expect(Array.isArray(res)).toBe(true);
    expect(res).toHaveLength(2);
    for (const s of res) {
      expect(s.password).toBeUndefined();
    }
  });
});

describe("studentService.countByNames", () => {
  test("delegates counting to the repository and returns a number", () => {
    mockCountStudentsByName.mockReturnValueOnce(5);
    const count = service.countByNames(["Ann", "Bob"]);
    expect(mockCountStudentsByName).toHaveBeenCalledWith(["Ann", "Bob"]);
    expect(count).toBe(5);
  });
});

describe("studentService.findByMinScore", () => {
  test("returns an array without passwords", async () => {
    const list = [
      { _id: 9, name: "Gina", password: "x", scores: { math: 80 } },
      { _id: 10, name: "Hank", password: "y", scores: { math: 90 } },
    ];
    mockFindStudentsByMinScore.mockResolvedValueOnce(list);

    const res = await service.findByMinScore("math", 70);

    expect(mockFindStudentsByMinScore).toHaveBeenCalledWith("math", 70);
    expect(res).toHaveLength(2);
    for (const s of res) {
      expect(s.password).toBeUndefined();
    }
  });
});
