import express from "express";
import {
  createHabits,
  getHabits,
  completeHabit
} from "../controllers/habitController";

const router = express.Router();
router.get("/test", (req, res) => {
  res.send("Habits route working");
});


router.post("/create", createHabits);


router.get("/:userId", getHabits);


router.post("/complete/:habitId", completeHabit);

export default router;

