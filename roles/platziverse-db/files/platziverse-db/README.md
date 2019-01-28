#platziverse-db

#usage

``` js

const setupDatabase = require('platziverse-db')

setupDatabase.init(config).then(db =>{
    const {Agent, Metric, MetricType} = db

}).catch(err => console.log(err))

```