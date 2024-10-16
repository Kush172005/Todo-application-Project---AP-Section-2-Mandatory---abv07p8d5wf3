const express = require("express");
const bodyParser = require("body-parser");
const { prisma } = require("../db/config");

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.get("/", (_, res) => {
    res.send("hello world");
});

app.post("/create", async (req, res) => {
    const { task } = req.body;

    if (!task) {
        return res.status(400).json({ error: "Task is required" });
    }

    try {
        const newTodo = await prisma.todos.create({
            data: {
                task,
            },
        });

        return res
            .status(201)
            .json({ id: newTodo.id, message: "Todo is created" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/getAll", async (req, res) => {
    try {
        const getAllTodo = await prisma.todos.findMany();
        console.log(getAllTodo);
        return res.status(200).json({ todos: getAllTodo });
    } catch (error) {
        console.log(error);
    }
});

app.patch("/update/:id", async (req, res) => {
    const { id } = parseInt(req.params.id);
    const { task, completed } = req.body;

    if (!task && !completed) {
        return res
            .status(400)
            .json({ message: "No fields provided to update" });
    }
    try {
        const updateTodo = await prisma.todos.update({
            where: {
                id,
            },
            todo: { task, completed },
        });

        if (!updateTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }
        return res.status(200).json({
            message: "Todo is updated",
            todo: updateTodo,
        });
    } catch (error) {
        console.log(error);
        return res.status({ error });
    }
});

app.delete("/delete/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const findTodo = await prisma.todos.findUnique({
            where: {
                id,
            },
        });

        if (!findTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        await prisma.todos.delete({
            where: {
                id,
            },
        });

        return res.status(200).json({ message: "Todo is Deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
