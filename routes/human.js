const express = require('express');
const router = express.Router();
const Human = require('../models/human');
const Joi = require('joi');

const getHuman = async (req, res, next) => {
    let human;

    if (req.params.id.length !== 24) return res.status(404).send('Invalid id.');
    try {
        human = await Human.findById(req.params.id);
        if (!human) return res.status(404).send('Cannot find human.');
    } catch (error) {
        return res.status(500).send(`Error ${error}.`);
    }
    res.human = human;
    next();
}

const checkEmail = async (email) => {
    let human;

    try {
        human = await Human.find({ email }) ? true : false;
    } catch (error) {
        return helper.error(`Error ${error}.`);
    }
    return human;
}

const validateHuman = (human, existingHuman) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required().custom((value, helper) => {
            if (existingHuman) {
                if (existingHuman.email == value) {
                    return value;
                }
            }
            const emailExists = checkEmail(value)
            if (emailExists) {
                return helper.message(`${human.email} email already exists.`);
            }
        })
    });

    return schema.validate(human);
}

router.get('/', async (req, res) => {
    try {
        const human = await Human.find();
        res.json(human);
    } catch (error) {
        return res.status(500).send(`Error ${error}.`);
    }
});

router.get('/:id', getHuman, (req, res) => {
    // try {
    //     const human = await Human.findById(req.params.id);
    //     res.json(human);
    // } catch (error) {
    //     return res.status(500).send(`Error ${error}.`);
    // }
    res.json(res.human);
});

router.post('/', async (req, res) => {
    const { error } = validateHuman(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const human = new Human({
        name: req.body.name,
        email: req.body.email
    });

    try {
        const new_human = await human.save();
        res.status(201).json(new_human);
    } catch (error) {
        res.status(500).send(`Error ${error}.`);
    }
});

router.patch('/:id', getHuman, async (req, res) => {
    const { error } = validateHuman(req.body, res.human);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const human = res.human;
        if (human.name) human.name = req.body.name;
        if (human.email) human.email = req.body.email;
        const updated_human = await human.save();
        res.json(updated_human);
    } catch (error) {
        res.status(500).send(`Error ${error}.`);
    }
});

router.delete('/:id', getHuman, async (req, res) => {
    try {
        const deleted_human = res.human.name;
        await res.human.remove();
        res.send(`${deleted_human} is deleted.`);
    } catch (error) {
        return res.status(500).send(`Error ${error}.`);
    }
});

module.exports = router;