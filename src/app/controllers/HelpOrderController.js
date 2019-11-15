import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    const { studentId } = req.params;

    const student = await Student.findOne({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(400).json({ error: 'This ID is not valid' });
    }

    const helporder = await HelpOrder.findAll({
      where: { student_id: studentId },
    });

    return res.json({ helporder });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Please send one question' });
    }

    const { studentId } = req.params;

    const student = await Student.findOne({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(400).json({
        error: 'Something is wrong with your ID. Please contact the reception',
      });
    }

    const { question } = req.body;

    const { id } = await HelpOrder.create({
      question,
      student_id: studentId,
    });

    return res.json({
      id,
      question,
      studentId,
    });
  }
}

export default new HelpOrderController();
