import * as Yup from 'yup';
import { addMonths, parseISO } from 'date-fns';

import Enrrolment from '../models/Enrrolment';
import Plan from '../models/Plan';
import Student from '../models/Student';
import Mail from '../../lib/Mail';

class EnrrolmentController {
  async index(req, res) {
    const enrrolments = await Enrrolment.findAll({
      attributes: [
        'id',
        'student_id',
        'plan_id',
        'start_date',
        'end_date',
        'price',
      ],
    });

    return res.json(enrrolments);
  }

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

    const enrollmentExists = await Enrrolment.findOne({
      where: { student_id },
    });

    if (enrollmentExists) {
      return res
        .status(401)
        .json({ error: 'This student is already enrolled at Gympoint' });
    }

    const student = await Student.findOne({
      where: { id: student_id },
    });

    const plan = await Plan.findOne({
      where: { id: plan_id },
    });

    if (!student) {
      return res.status(400).json({ error: 'Student ID not exist' });
    }

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

  async update(req, res) {
    const schema = Yup.object().shape({
      enrrolment_id: Yup.number().required(),
      start_date: Yup.date().required(),
      plan_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { enrrolment_id, start_date, plan_id } = req.body;

    const enrrolment = await Enrrolment.findOne({
      where: { id: enrrolment_id },
    });

    if (!enrrolment) {
      return res.status(400).json({ error: 'Have no enrrolment with this ID' });
    }

    const plan = await Plan.findOne({
      where: { id: plan_id },
    });

    const price = plan.duration * plan.price;

    const end_date = addMonths(parseISO(start_date), plan.duration);

    await enrrolment.update({ price, start_date, end_date, plan_id });

    return res.json({
      enrrolment_id,
      start_date,
      plan_id,
      price,
      end_date,
    });
  }

  async delete(req, res) {
    const { enrrolment_id } = req.body;

    await Enrrolment.destroy({ where: { id: enrrolment_id } });

    return res.json({ message: 'Enrrolment deleted' });
  }
}

export default new EnrrolmentController();
