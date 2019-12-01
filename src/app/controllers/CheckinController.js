import {
  currentDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfHour,
} from 'date-fns';
import pt from 'date-fns/locale/pt';
import { Op } from 'sequelize';
import Student from '../models/Student';
// import Enrollment from '../models/Enrollment';

import Checkin from '../schemas/Checkin';

class CheckinController {
  async index(req, res) {
    const { student_id } = req.params;
    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({
        error: 'Student does not exist.',
        message: 'O Aluno não existe',
      });
    }

    const checkins = await Checkin.find({
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

    /**
     * Verifica quando checkins foram feitos dentro de 7 dias e bloqueia
     * quando atinge 5 dias.
     */
    const dateLimit = 5;
    const dateWeek = 7;

    const lastWeek = subDays(currentDay, dateWeek);
    const countCheckInWeek = await Checkin.find({
      student_id,
    })
      .gt('createdAt', startOfWeek(lastWeek))
      .lt('createdAt', endOfWeek(currentDay))
      .countDocuments();

    if (countCheckInWeek === dateLimit) {
      return res.status(400).json({
        error: 'Limit execeeded',
        message:
          'Limite excedido, você pode realizar 5 check-ins dentro de 7 dias',
      });
    }

    const hourStart = startOfHour(currentDay);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    const checkins = await Checkin.create({
      content: `Check-in feito por ${student.name}, no ${formattedDate} `,
      student_id,
    });

    return res.json(checkins);
  }
}

export default new CheckinController();
