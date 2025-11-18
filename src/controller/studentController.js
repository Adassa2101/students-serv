import * as repo from "../repository/studentRepository.js";


export const addStudent = (req, res) => {
    const success = repo.addStudent(req.body);
    if (success) {
        res.status(204).send();
    } else {
        res.status(409).send();
    }
}


export const findStudent = (req, res) => {
    const student = repo.findStudent(+req.params.id);
    if (student) {
        const {password, ...studentWithoutPassword} = student;
        res.json(studentWithoutPassword);
    } else {
        res.status(404).send();
    }
}


export const updateStudent = (req, res) => {
    // TODO update student name or password
}


export const deleteStudent = (req, res) => {
    // TODO delete student
}


export const addScore = (req, res) => {
    // TODO add score to student
}


export const findByName = (req, res) => {
    // TODO find students by name
}


export const countByNames = (req, res) => {
    // TODO count students by names
}


export const findByMinScore = (req, res) => {
    // TODO find students by min score
}
