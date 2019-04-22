'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const autoIncrementModelID = require('./counterModel');

var taskSchema = new Schema({
  id: { type: Number, unique: true, min: 1 },
  title: { type: String },
  shortDescription: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  type: { type: String, required: true, enum: ['QUIZ'] },
  data: {
    questionType: { type: String, enum: ['ONE_CHOICE'], default: ['ONE_CHOICE'] },
    answerType: { type: String, enum: ['ANSWER_POPUP', 'ANSWER_SUMMARY', 'ANSWER_BOTH'], default: ['ANSWER_SUMMARY'] },
    taskSummary: { type: String },
    questionSet: [{
      id: { type: Number, min: 1 },
      question: { text: { type: String }, image: { type: String } },
      options: [{ text: { type: String }, image: { type: String } }],
      popup: [String],
      correct: { type: Number }
    }]
  }
});

const NOT_EMPTY = ' cannot be empty'

taskSchema.pre('validate', function(next) {
  if (this.type !== 'QUIZ') return next()

  if (!this.data.questionType) return next(new Error('QUESTION TYPE' + NOT_EMPTY))
  if (!this.data.answerType) return next(new Error('ANSWER TYPE' + NOT_EMPTY))
  if ((this.data.answerType === 'ANSWER_SUMMARY' ||
    this.data.answerType === 'ANSWER_BOTH') &&
    !this.data.taskSummary) return next(new Error('TASK SUMMARY' + NOT_EMPTY))
  if (!this.data.questionSet || this.data.questionSet.length === 0) return next(new Error('QUESTION SET' + NOT_EMPTY))
  
  let questionIDsArr = []
  this.data.questionSet.forEach((set) => {

    if (!set.id) return next(new Error('QUESTION ID' + NOT_EMPTY))
    questionIDsArr.push(set.id)
    if (!set.question) return next(new Error('QUESTION TEXT' + NOT_EMPTY))
    if (!set.options || set.options.length === 0) return next(new Error('QUESTION OPTIONS' + NOT_EMPTY))
    if(set.correct === undefined) return next(new Error('QUESTION CORRECT' + NOT_EMPTY))
    
    // For ANSWER_TYPE POPUP or BOTH
    if ((this.data.answerType === 'ANSWER_POPUP' ||
      this.data.answerType === 'ANSWER_BOTH') &&
      !set.popup || set.popup.length === 0) return next(new Error('QUESTION POPUP' + NOT_EMPTY))
    if (set.options.length !== set.popup.length) {
      return next(new Error("QUESTION POPUP AND OPTIONS LENGTH DO NOT MATCH"))
    }
  })

  if (new Set(questionIDsArr).size !== questionIDsArr.length) return next(new Error('QUESTION IDS are not unique'))

  next()
});

taskSchema.pre('save', function (next) {
  if (!this.isNew) {
    next();
    return;
  }

  autoIncrementModelID('tasks', this, next);
});

module.exports = mongoose.model('task', taskSchema);
