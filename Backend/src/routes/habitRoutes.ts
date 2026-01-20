import express from "express";
import {
  createHabits,
  getHabits,
  completeHabit,
  addHabit,
  deleteHabit,
  updateHabit
} from "../controllers/habitController";

const router = express.Router();
router.get("/test", (req, res) => {
  res.send("Habits route working");
});


router.post("/create", createHabits);
router.post("/add", addHabit);


router.get("/:userId", getHabits);


router.post("/complete/:habitId", completeHabit);

router.put("/:habitId", updateHabit);
router.delete("/:habitId", deleteHabit);

export default router;

