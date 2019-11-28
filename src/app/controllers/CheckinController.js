import Student from '../models/Student';
import Enrollment from '../models/Enrollment';
import CheckIn from '../schemas/CheckIn';

class CheckinsController {
  async index(req, res) {
    const { student_id } = req.params;
    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({
        error: 'Student does not exist.',
        message: 'O Aluno não existe',
      });
    }

    const checkins = await CheckIn.find({
      student_id,
    });
    return res.json(checkins);
  }

  async store(req, res) {
    const { student_id } = req.params;
    const student = await Student.findByPk(student_id);
    const enrollment = await Enrollment.findOne({
      where: { student_id },
    });


