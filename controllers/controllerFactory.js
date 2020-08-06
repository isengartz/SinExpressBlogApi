const path = require('path');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const httpCodes = require('../utils/httpStatuses');
const ApiFeatures = require('../utils/apiFeatures');
const downloadFile = require('../utils/downloadFile');
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

// Downloads also a file
// @downloadableEntity is the column where the image is
exports.createOneWithDownloadFile = (Model, downloadableEntity) =>
  catchAsync(async (req, res, next) => {
    const documentName = Model.collection.collectionName;
    const document = await Model.create(req.body);
    if (document && req.body[downloadableEntity]) {
      const imageName = req.body[downloadableEntity].split('/').pop();

      const pathToSave = path.resolve(
        `${process.cwd()}/public/images/${imageName}`
      );

      await downloadFile(req.body[downloadableEntity], pathToSave).catch(() => {
        console.log('Image Failed to get Saved. Unlucky xD');
      });

      // Should update the donwloadableEntity with the local path here but meh not gonna use it at all xD
    }
    res.status(httpCodes.HTTP_CREATED).json({
      status: 'success',
      data: {
        [documentName]: document,
      },
    });
  });

// Find one document of given Model
exports.findOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const documentName = Model.collection.collectionName;
    // Populate extra data if needed
    let query = Model.findById(req.params.id);
    if (populateOptions) {
      query = query.populate({ populateOptions });
    }
    const document = await query;
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

    const features = new ApiFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const documents = await features.query;

    res.status(httpCodes.HTTP_OK).json({
      status: 'success',
      results: documents.length,
      data: {
        [documentName]: documents,
      },
    });
  });

// Delete a document of given Model
exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const documentName = Model.collection.collectionName;
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(
        new AppError(
          `No ${documentName} found with that ID`,
          httpCodes.HTTP_NOT_FOUND
        )
      );
    }
    res.status(httpCodes.HTTP_NO_CONTENT).json({
      status: 'success',
      data: null,
    });
  });

// Updates a document of given Model
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const documentName = Model.collection.collectionName;
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!document) {
      return next(
        new AppError(
          `No ${documentName} found with that ID`,
          httpCodes.HTTP_NOT_FOUND
        )
      );
    }
    res.status(httpCodes.HTTP_OK).json({
      status: 'success',
      data: {
        [documentName]: document,
      },
    });
  });
