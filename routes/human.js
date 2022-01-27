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

const validateHuman = (human) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required()
        // .custom((value, helper) => {
        //     if (existingHuman) {
        //         if (existingHuman.email == value) {
        //             return value;
        //         }
        //     }
        //     try {
        //         const emailExists = await Human.find({ email: value });
        //         if (emailExists.length > 0) return helper.message(`${human.email} email already exists.`);
        //     } catch (error) {
        //         return helper.message(`Error ${error}.`);
        //     }
        // })
    });
    return schema.validate(human);
}

router.get('/human/', async (req, res) => {
    try {
        const human = await Human.find();
        res.json(human);
    } catch (error) {
        return res.status(500).send(`Error ${error}.`);
    }
});

router.get('/human/:id', getHuman, (req, res) => {
    res.json(res.human);
});

router.post('/human/', async (req, res) => {
    const { error } = validateHuman(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    try {
        const { name, email } = req.body
        const human_exists = await Human.find({ email });
        if (human_exists.length > 0) {
            res.status(400).send(`Email ${req.body.email} is already exists.`);
            return;
        }
        const human = new Human({ name, email });
        const new_human = await human.save();
        res.status(201).json(new_human);
    } catch (error) {
        res.status(500).send(`Error ${error}.`);
    }
});

router.put('/human/:id', getHuman, async (req, res) => {
    const { error } = validateHuman(req.body, res.human);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const { name, email } = req.body;
        const human = res.human;
        if (email !== human.email) {
            const human_exists = await Human.find({ email });
            if (human_exists.length > 0) {
                res.status(400).send(`Email ${req.body.email} is already exists.`);
                return;
            }
        }
        human.name = name;
        human.email = email;
        const updated_human = await human.save();
        res.json(updated_human);
    } catch (error) {
        res.status(500).send(`Error ${error}.`);
    }
});

router.delete('/human/:id', getHuman, async (req, res) => {
    try {
        const deleted_human = res.human.name;
        await res.human.remove();
        res.send(`${deleted_human} is deleted.`);
    } catch (error) {
        return res.status(500).send(`Error ${error}.`);
    }
});

module.exports = router;
