module.exports = {
    development: {
        mongoURI: 'mongodb://localhost:27017/',
        db: 'digital_billboard',
        auth: {
            secret: process.env.SECRET,
            issuer: ''
        },
        port: {
            http: 8080,
            // https: 8081
        },
        url: 'http://localhost:8080',
    },
    production: {
        mongoURI: 'mongodb://localhost:27017/',
        db: 'digital_billboard',
        auth: {
            secret: process.env.SECRET,
            issuer: ''
        },
        port: {
            http: 8080,
            // https: 8081
        },
        url: 'http://localhost:8080',
    }
}