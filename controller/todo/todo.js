import { getCurrentTime } from "../../utils/utils.js";
import Todo from "../../models/todoSchema.js"; 
import passport from 'passport';

// todo 
const testTodo = async (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        console.log(user)
    });
    // res.json(await Todo.find().sort({ _id: -1 }))
}


const selectTodo = async (req, res) => {
    res.json(await Todo.find().sort({ _id: -1 }))
}

const insertTodo = async (req, res) => {
    const todo = {
        title: req.body.title,
        content: req.body.content,
    };

    await Todo.create(todo);
    res.send("success");
};

const modifyTodo = async (req, res) => {
    const todo = {
        title: req.body.title,
        content: req.body.content,
        isChecked: req.body.isChecked,
        updatedAt: getCurrentTime(),
    };
    await Todo.updateOne({ _id: req.body._id }, todo);
    res.send("success");
};

const deleteTodo = async (req, res) => {
    await Todo.deleteOne({ _id: req.body._id });
    res.send("success");
};

export { 
    selectTodo, insertTodo, modifyTodo, deleteTodo, testTodo
};
