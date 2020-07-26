class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // Filters the query based on params;
  filter(manualExcluded = []) {
    const queryObj = { ...this.queryString };
    // remove the excludedFields
    const excludedFields = ['page', 'sort', 'limit', 'fields'].concat(
      manualExcluded
    );
    excludedFields.forEach((el) => delete queryObj[el]);
    let queryString = JSON.stringify(queryObj);
    queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => {
      return `$${match}`;
    });
    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  // sort the documents
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // Select only specific fields
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    // Default per page 20
    const limit = this.queryString.limit * 1 || 20;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;
