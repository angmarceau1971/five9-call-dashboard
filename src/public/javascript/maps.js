// Map of U.S. with ZIP3 areas colored by calls offered.
// Offers methods to create/draw the map and update when new data is received.
class CallMap {
    // Create and draw map on initial run
    async create(callData, field, keyFn, rollupFn) {
        // Taken from d3.schemeBlues[9]
        this.colors = ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"];

        let width = 960,
            height = 500;
        let processedData = this.process(callData, keyFn, rollupFn);

        this.calls = d3.map(processedData, (d) => d.key);
        let minValue = d3.min(processedData, (d) => d.value[field]);
        let maxValue = d3.max(processedData, (d) => d.value[field]);

        this.x = d3.scaleLinear()
            .domain(d3.extent(processedData, (d) => d.value[field]))
            .rangeRound([600, 860]);

        this.color = d3.scaleThreshold()
            .domain(d3.range(0, maxValue, maxValue / 9))
            .range(this.colors);

        this.path = d3.geoPath();

        this.svg = d3.select('svg')
            .attr('width', width)
            .attr('height', height);

        // Key / legend
        this.keyTitle = 'Calls offered';
        this.drawKey(this.x, this.color);

        return d3.queue()
            .defer(d3.json, API_URL + 'states')
            .defer(d3.json, API_URL + 'zip3-data')
            .await((err, usa, zipData) => this.onReady(err, usa, zipData, field));
    }

    // Assign initial variables when map is first created and topographic
    // data is first loaded
    onReady(err, usa, zipData, field) {
        this.zipData = zipData;
        this.usa = usa;
        this.drawZips(zipData, field);
        this.drawStates(usa);
    }

    // Update map with new data
    async update(callData, field, keyFn, rollupFn) {
        // Check if this chart already exists. If not, create it.
        if (!this.svg) return this.create(callData, field, keyFn, rollupFn);

        // format the data properly
        let processedData = this.process(callData, keyFn, rollupFn);
        // match calls to keys (zip codes)
        this.calls = d3.map(processedData, (d) => d.key);

        // update domain and range
        let max = d3.max(processedData, (d) => d.value[field]);
        this.x.domain(d3.extent(processedData, (d) => d.value[field]));
        this.color.domain(d3.range(0, max, max / 9));

        // Key / legend
        // remove then redraw the color key
        this.g.remove().exit();
        this.drawKey(this.x, this.color);

        // data - paint the state lines and zip codes
        // clear old states and zips
        this.svg.selectAll('.zips, .states').remove().exit();
        // then rebuild them
        this.drawZips(this.zipData, field);
        this.drawStates(this.usa);
    }

    // Draw ZIP3 areas, colored by number of calls
    // ${zipData} is GeoJSON describing the topography
    drawZips(zipData, field) {
        let backgroundColor = '#feffff';
        // Sort so that areas with call data are drawn last and end up on top
        let sorted = zipData.features.sort((a, b) => {
            if (!this.calls.has(a.properties.ZIP)) return -1;
            return 1;
        });

        this.svg.insert('g', '.key')
            .attr('class', 'zips')
          .selectAll('path')
          .data(sorted)
          .enter().append('path')
            .attr('d', this.path)
            .attr('fill', (d) => {
                let zip = d.properties.ZIP;
                if (!this.calls.has(zip)) return backgroundColor;
                return this.color(this.calls.get(zip).value[field]);
            })
            .attr('stroke', (d) => {
                let zip = d.properties.ZIP;
                if (!this.calls.has(zip)) return backgroundColor;
                return 'hsla(208, 30%, 60%, 0.5)';
            })
          .append('title')
            .text((d) => {
                let zip = d.properties.ZIP;
                let o = { calls: 0, customers: 0, callsPerCustomer: 0 };
                if (this.calls.has(zip)) {
                    o = this.calls.get(zip).value;
                }
                return `ZIP3: ${zip}\nCalls: ${o.calls}\nCustomers: ${o.customers}\nCalls divided by customer count: ${d3.format(".2%")(o.callsPerCustomer)}`;
            });
    }

    // Draw the state outlines
    drawStates(usa) {
        this.svg.insert('g', '.key')
            .attr('class', 'states')
          .selectAll('path')
          .data(usa.features)
          .enter().append('path')
            .attr('d', this.path);
    }

    // Draw the key/legend
    drawKey(x, color) {
        this.g = this.svg.append('g')
            .attr('class', 'key')
            .attr('transform', 'translate(0,40)');
        this.g.selectAll('rect')
            .data(color.range().map((d) => {
                d = color.invertExtent(d);
                if (d[0] == null) d[0] = x.domain()[0];
                if (d[1] == null) d[1] = x.domain()[1];
                return d;
            }))
            .enter().append('rect')
              .attr('height', 8)
              .attr('x', (d) => x(d[0]))
              .attr('width', (d) => {
                  return Math.abs(x(d[1]) - x(d[0]));
              } )
              .attr('fill', (d) => color(d[0]));

        this.g.append('text')
            .attr('class', 'caption')
            .attr('x', x.range()[0])
            .attr('y', -6)
            .attr('fill', '#444')
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold')
            .text(this.keyTitle);
          this.g.call(d3.axisBottom(x)
            .tickSize(13)
            .tickFormat(this.formatLegend)
            .tickValues(color.domain()))
          .select('.domain')
            .remove();
    }

    /**
     * Rolls up JSON data according to key and value extraction functions
     * @param  {Object}   data     JSON data
     * @param  {Function} keyFn    extract key from each data point
     * @param  {Function} rollupFn summarize values from each data point
     * @return {Object}            nested data for easy parsing by D3
     */
    process(data, keyFn, rollupFn) {
        let callsByZip = d3.nest()
            .key(keyFn)
            .rollup(rollupFn)
            .entries(data)
            .filter((d) => d.key != ''); // remove calls with no zipcode assigned
        return callsByZip;
    }
}
