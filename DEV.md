## Development

Just some random reminders for myself:

Build:

    jssh make

Install `npm` dependencies.

    npm install --no-bin-links
    npm install -g mocha tsd jssh
    tsd query node -a install -ros  

Docker:

    docker run -it --rm -v /share/jssh:/code streamich/node bash
