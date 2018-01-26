// Test parsing of fault string (error) responses based on the format returned
// by Five9's configuration API.

process.env.NODE_ENV = 'test';
const chai = require('chai');
const should = chai.should();
const five9 = require('../src/helpers/five9-interface');
const parseString = require('xml2js').parseString; // parse XML to JSON

const requestType = `configuration`;
const faultString = 'You are a dangus.';
const faultSoap = `<env:Envelope xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">
        <env:Header/>
        <env:Body>
            <env:Fault>
                <faultcode>env:Server</faultcode>
                <faultstring>${faultString}</faultstring>
                <detail>
                    <ns1:ObjectNotFoundFault xmlns:ns1="http:/five9-url.coms/">
                        <id xmlns:ns2="http:/five9-url.coms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:nil="true"/>
                        <message>${faultString}</message>
                        <objectName xmlns:ns2="http:/five9-url.coms/"></objectName>
                        <objectType xmlns:ns2="http:/five9-url.coms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:type="ns2:wsObjectType">Skill</objectType>
                    </ns1:ObjectNotFoundFault>
                </detail>
            </env:Fault>
        </env:Body>
    </env:Envelope>`;

describe('Testing fault string description extractor', function() {
    this.timeout(5000);
    it('should return fault string', async function(done) {
        let faultJson;
        await parseString(faultSoap, (err, result) => {
            console.log(err);
            console.log(result);
            // faultJson = five9.jsonToReturnValue(result, requestType);
            faultJson = result;
        });
        console.log(faultJson);
        five9.getFaultStringFromData(faultJson).should.eql(faultString);
    });
});
