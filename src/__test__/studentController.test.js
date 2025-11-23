// ESM Jest тесты для контроллера, с моками слоя сервиса
// Используем jest.unstable_mockModule для ESM-моков
import { jest } from '@jest/globals';
// Заготовка моков сервиса
const serviceMocks = {
  addStudent: jest.fn(),
  findStudent: jest.fn(),
  updateStudent: jest.fn(),
  deleteStudent: jest.fn(),
  addScore: jest.fn(),
  findByName: jest.fn(),
  countByNames: jest.fn(),
  findByMinScore: jest.fn()
};

// Мокаем модуль сервиса ДО импортирования контроллера
jest.unstable_mockModule("../service/studentService.js", () => ({
  __esModule: true,
  ...serviceMocks
}));

// Динамический импорт контроллера после установки моков
let controller;
beforeAll(async () => {
  controller = await import("../controller/studentController.js");
});

beforeEach(() => {
  // сбрасываем все моки перед каждым тестом
  Object.values(serviceMocks).forEach(fn => fn.mockReset());
});

// Вспомогательные фабрики для req/res
const makeRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.sendStatus = jest.fn().mockReturnValue(res);
  return res;
};

describe("studentController", () => {
  describe("addStudent", () => {
    test("201 когда студент создан", async () => {
      serviceMocks.addStudent.mockResolvedValue(true);
      const req = { body: { id: 1, name: "Ann", password: "p" } };
      const res = makeRes();

      await controller.addStudent(req, res);

      expect(serviceMocks.addStudent).toHaveBeenCalledWith({ id: 1, name: "Ann", password: "p" });
      expect(res.sendStatus).toHaveBeenCalledWith(201);
    });

    test("409 когда дубликат", async () => {
      serviceMocks.addStudent.mockResolvedValue(false);
      const req = { body: { id: 1, name: "Ann", password: "p" } };
      const res = makeRes();

      await controller.addStudent(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(409);
    });

    test("400 при невалидном теле", async () => {
      const req = { body: { name: "Ann" } }; // нет id и password
      const res = makeRes();

      await controller.addStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
      expect(serviceMocks.addStudent).not.toHaveBeenCalled();
    });
  });

  describe("findStudent", () => {
    test("200 и json когда найден", async () => {
      const student = { _id: 1, name: "Ann" };
      serviceMocks.findStudent.mockResolvedValue(student);
      const req = { params: { id: "1" } };
      const res = makeRes();

      await controller.findStudent(req, res);

      expect(serviceMocks.findStudent).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(student);
    });

    test("404 когда не найден", async () => {
      serviceMocks.findStudent.mockResolvedValue(null);
      const req = { params: { id: "2" } };
      const res = makeRes();

      await controller.findStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe("updateStudent", () => {
    test("400 при невалидном теле", async () => {
      const req = { params: { id: "1" }, body: { foo: "bar" } };
      const res = makeRes();

      await controller.updateStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(serviceMocks.updateStudent).not.toHaveBeenCalled();
    });

    test("200 и json когда найден и обновлен", async () => {
      const updated = { _id: 1, name: "Ben" };
      serviceMocks.updateStudent.mockResolvedValue(updated);
      const req = { params: { id: "1" }, body: { name: "Ben" } };
      const res = makeRes();

      await controller.updateStudent(req, res);

      expect(serviceMocks.updateStudent).toHaveBeenCalledWith(1, { name: "Ben" });
      expect(res.json).toHaveBeenCalledWith(updated);
    });

    test("404 когда не найден", async () => {
      serviceMocks.updateStudent.mockResolvedValue(null);
      const req = { params: { id: "9" }, body: { name: "X" } };
      const res = makeRes();

      await controller.updateStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("deleteStudent", () => {
    test("200 и json при удалении найденного", async () => {
      const deleted = { _id: 1, name: "Ann" };
      serviceMocks.deleteStudent.mockResolvedValue(deleted);
      const req = { params: { id: "1" } };
      const res = makeRes();

      await controller.deleteStudent(req, res);

      expect(serviceMocks.deleteStudent).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(deleted);
    });

    test("404 когда не найден", async () => {
      serviceMocks.deleteStudent.mockResolvedValue(null);
      const req = { params: { id: "7" } };
      const res = makeRes();

      await controller.deleteStudent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("addScore", () => {
    test("400 при невалидном теле", async () => {
      const req = { params: { id: "1" }, body: { score: 90 } }; // нет examName
      const res = makeRes();

      await controller.addScore(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(serviceMocks.addScore).not.toHaveBeenCalled();
    });

    test("204 при успешном добавлении", async () => {
      serviceMocks.addScore.mockResolvedValue(true);
      const req = { params: { id: "1" }, body: { examName: "math", score: 95 } };
      const res = makeRes();

      await controller.addScore(req, res);

      expect(serviceMocks.addScore).toHaveBeenCalledWith(1, "math", 95);
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    test("404 если студент не найден", async () => {
      serviceMocks.addScore.mockResolvedValue(false);
      const req = { params: { id: "2" }, body: { examName: "phys", score: 70 } };
      const res = makeRes();

      await controller.addScore(req, res);

      expect(res.sendStatus).toHaveBeenCalledWith(404);
    });
  });

  describe("findByName", () => {
    test("200 и массив студентов", async () => {
      const list = [{ _id: 1 }, { _id: 2 }];
      serviceMocks.findByName.mockResolvedValue(list);
      const req = { params: { name: "Ann" } };
      const res = makeRes();

      await controller.findByName(req, res);

      expect(serviceMocks.findByName).toHaveBeenCalledWith("Ann");
      expect(res.json).toHaveBeenCalledWith(list);
    });
  });

  describe("countByNames", () => {
    test("принимает массив имен", async () => {
      serviceMocks.countByNames.mockResolvedValue(3);
      const req = { query: { names: ["Ann", "Ben"] } };
      const res = makeRes();

      await controller.countByNames(req, res);

      expect(serviceMocks.countByNames).toHaveBeenCalledWith(["Ann", "Ben"]);
      expect(res.json).toHaveBeenCalledWith(3);
    });

    test("оборачивает одиночную строку в массив", async () => {
      serviceMocks.countByNames.mockResolvedValue(1);
      const req = { query: { names: "Ann" } };
      const res = makeRes();

      await controller.countByNames(req, res);

      expect(serviceMocks.countByNames).toHaveBeenCalledWith(["Ann"]);
      expect(res.json).toHaveBeenCalledWith(1);
    });
  });

  describe("findByMinScore", () => {
    test("200 и массив студентов", async () => {
      const list = [{ _id: 1 }];
      serviceMocks.findByMinScore.mockResolvedValue(list);
      const req = { params: { exam: "math", minScore: "60" } };
      const res = makeRes();

      await controller.findByMinScore(req, res);

      expect(serviceMocks.findByMinScore).toHaveBeenCalledWith("math", 60);
      expect(res.json).toHaveBeenCalledWith(list);
    });
  });
});
