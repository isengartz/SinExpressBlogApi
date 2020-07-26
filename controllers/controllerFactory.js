const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const httpCodes = require('../utils/httpStatuses');

// Create a new document of given Model
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const documentName = Model.collection.collectionName;
    const document = await Model.create(req.body);
    res.status(httpCodes.HTTP_CREATED).json({
      status: 'success',
      data: {
        [documentName]: document,
      },
    });
  });

// Find one document of given Model
exports.findOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const documentName = Model.collection.collectionName;
    const document = await Model.findById(req.params.id);
    res.status(httpCodes.HTTP_OK).json({
      status: 'success',
      data: {
        [documentName]: document,
      },
    });
  });

// Find all documents of given Model
exports.findAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const documentName = Model.collection.collectionName;
    const document = await Model.find();
    res.status(httpCodes.HTTP_OK).json({
      status: 'success',
      results: document.length,
      data: {
        [documentName]: document,
      },
    });
  });

// Delete a document of given Model
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(
        new AppError(`No document found with that ID`, httpCodes.HTTP_NOT_FOUND)
      );
    }
    res.status(httpCodes.HTTP_NO_CONTENT).json({
      status: 'success',
      data: null,
    });
  });
