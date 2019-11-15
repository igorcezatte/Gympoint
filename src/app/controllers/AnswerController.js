import * as Yup from 'yup';

import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Mail from '../../lib/Mail';

class AnswerController {
  async index(req, res) {
    const helporders = await HelpOrder.findAll({
      where: { answer: null },
    });

    return res.json({ helporders });
  }

  async indexByStudent(req, res) {
    const { studentId } = req.params;

    const student = await Student.findOne({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(400).json({ error: 'This id does not exist' });
    }

    const helporders = await HelpOrder.findAll({
      where: { student_id: studentId },
    });

    return res.json({ helporders });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number().required(),
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.json({ error: 'Validation Fails' });
    }

    const { studentId } = req.params;
    const { id, answer } = req.body;

    console.log(studentId);

    const student = await Student.findOne({
      where: { id: studentId },
    });

    if (!student) {
      return res
        .status(400)
        .json({ error: 'This ID is not from a student of Gym' });
    }

    const helporder = await HelpOrder.findOne({
      where: { id },
    });

    if (!helporder) {
      return res
        .status(400)
        .json({ error: 'This Help Order ID does not exist' });
    }

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'Gympoint answer to your question',
      template: 'answer',
      context: {
        student: student.name,
        question: helporder.question,
        answer,
      },
    });

    await helporder.update({ answer, answer_at: new Date() });

    return res.json({ helporder });
  }
}

export default new AnswerController();
