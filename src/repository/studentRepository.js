import { Student } from "../model/student.js";


const students = new Map();


export const addStudent = ({id, name, password}) => {
    if(students.has(id)) {
        return false;
    }
    students.set(id, new Student(id, name, password));
    return true;
}

export const findStudent = id => students.get(id);

export const deleteStudent = id => {
    const student = students.get(id);
    if (student) {
        students.delete(id);
        return student;
    }
}

export const updateStudent = (id, data) => {
    const student = students.get(id);
    if (student) {
        Object.assign(student, data);
        return student;
    }
}

export const addScore = (id, exam, score) => {
    const student = students.get(id);
    if (student) {
        student.scores[exam] = score;
        return true;

    }
    return false;
}

export const findByName = (name) => {
    return Array.from(students.values()).filter(s => s.name.toLowerCase() === name.toLowerCase());
}

export const countByNames = (names) => {
    names = names.map(name => name.toLowerCase());
    return Array.from(students.values()).filter(s => names.includes(s.name.toLowerCase())).length;
}

export const findByMinScore = (exam, minScore) => {
    return Array.from(students.values()).filter(s => s.scores[exam] >= minScore);
}