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
