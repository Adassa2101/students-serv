let collection;


export const init = db => collection = db.collection('college');


export const addStudent = async ({id, name, password}) => {
    const existingStudent = await collection.findOne({_id: id});
    if (existingStudent) {
        return false;
    }
    await collection.insertOne({_id: id, name, password, scores: {}});
    return true;
}


export const findStudent = async id => {
    return await collection.findOne({_id: id});
}


export const deleteStudent = async id => {
    return await collection.findOneAndDelete({_id: id});
}


export const updateStudent = async (id, data) => {
    return await collection.findOneAndUpdate(
        {_id: id},
        {$set: data},
        {returnDocument: 'after'}
    );
}


export const addScore = async (id, exam, score) => {
    return await collection.findOneAndUpdate(
        {_id: id},
        {$set: {[`scores.${exam}`]: score}}
    )
}


export const findByName = (name) => {
    // TODO find by name
}


export const countByNames = (names) => {
    // TODO count by names
}


export const findByMinScore = (exam, minScore) => {
    // TODO find by min score
}
