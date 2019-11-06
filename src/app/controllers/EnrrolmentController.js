import * as Yup from 'yup';
import { addMonths, parseISO } from 'date-fns';

import Enrrolment from '../models/Enrrolment';
import Plan from '../models/Plan';
import Student from '../models/Student';
import Mail from '../../lib/Mail';

class EnrrolmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { student_id, plan_id, start_date } = req.body;

    const student = await Student.findOne({
      where: { id: student_id },
    });

    const plan = await Plan.findOne({
      where: { id: plan_id },
    });

    if (!plan) {
      return res.status(400).json({ error: 'Plan not exist' });
    }

    const price = plan.duration * plan.price;

    Enrrolment.price = price;

    const end_date = addMonths(parseISO(start_date), plan.duration);

    await Mail.sendMail({
      to: `${student.name} <${student.email}>`,
      subject: 'New plan contracted',
      template: 'enrrolments',
      context: {
        student: student.name,
        date: start_date,
      },
    });

    const enrrolment = await Enrrolment.create({
      student_id,
      plan_id,
      start_date,
      price,
      end_date,
    });

    return res.json({ enrrolment });
  }
}

export default new EnrrolmentController();
