import { Op } from 'sequelize';
import { subDays } from 'date-fns';

import Checkin from '../models/Checkin';
import Student from '../models/Student';
import Enrollment from '../models/Enrollment';

class CheckinController {
  async index(req, res) {
    const { studentId } = req.params;

    const student = await Student.findOne({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(400).json({
        error: 'Something is wrong with your ID. Please contact the reception',
      });
    }

    const checkins = await Checkin.findAll({
      where: { student_id: studentId },
    });

    return res.json({ student, checkins });
  }

  async store(req, res) {
    const { studentId } = req.params;

    const student = await Student.findOne({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(400).json({
        error: 'Something is wrong with your ID. Please contact the reception',
      });
    }

    const enrollment = await Enrollment.findOne({
      where: { student_id: studentId },
    });

    const today = new Date();

    if (enrollment.end_date < today) {
      return res.status(400).json({
        error: 'You have no enrollments active. Please contact the reception',
      });
    }

    const checkins = await Checkin.findAll({
      where: {
        student_id: studentId,
        created_at: { [Op.between]: [subDays(new Date(), 7), new Date()] },
      },
    });

    if (checkins.length > 4) {
      return res.json({
        error:
          'You already do 5 checkins in this week. Come to reception before you train to register this checkin ',
      });
    }

    const checkin = await Checkin.create({ student_id: studentId });
    return res.json({ checkin });
  }
}

export default new CheckinController();
