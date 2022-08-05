Feature('search');

const { I } = inject();
let access_token;

Before(async() => {
    // Get some precondition data first
    // Using jes2021 account
    const ticket_resp = await I.sendPostRequest(
        '/authentication/login', 
        {},
        {
            "authorization": 'TESTCompany username="",company="",realm="",nonce="61692cef53877940a1b58d2d:61692cef53877940a1b58d2e",qop="auth-int",deviceUniqueIdentifier="string",nc="00000003",cnonce="f6bbb796",uri="/v1/authentication/login",algorithm="md5",response="a693afc01f67e1ab22c2bddb95c88bf5"'
        }
    );
    // Verify ticket from response
    if(ticket_resp && ticket_resp.data && Object.keys(ticket_resp.data).length > 0) {
        // Get access token
        const token_resp = await I.sendPostRequest(
            '/authentication/login/mfa/verify', 
            {
                "ticket": ticket_resp.data.ticket,
                "passcode": "111111",
                "userId": ticket_resp.data.userId,
                "companyId": ticket_resp.data.companyId,
                "role": "EXPERT"
            },
            {
                "content-type": 'application/json'
            }
        );
        // Verify response data
        if(token_resp && token_resp.data && Object.keys(token_resp.data).length > 0) {
            access_token = 'Bearer ' + token_resp.data.accessToken
        }
    }
  });


Scenario('Search client by string', async({ I }) => {
    let search_string = 'jenife';
    let search_resp = await I.sendPostRequest(
        '/user_management/clients/search', 
        {
            "searchString": search_string,
            "pageSize": 150,
            "pageNumber": 1,
            "filters": [],
            "statuses": [
                "ACTIVE"
            ],
            "negativeFilter": true,
            "externalCompanyIds": [],
            "exclusivelyByExternalCompanies": true,
            "jwttoken": "string"
        },
        {
            "Authorization": access_token
        }
    );

    // Assertion & Validations
    const data = search_resp.data;
    // Respond successfully
    I.assertEqual(data.success, true);
    // Result is not empty
    I.assertAbove(data.records.length, 0);
    // Result contain search string
    I.assertContain(data.records[0].name, search_string);
});


Scenario('Get client detail by ID', async({ I }) => {
    let client_id = '6041f4ad2a41450fe9ce3a9c';
    let search_resp = await I.sendGetRequest(
        '/user_management/clients/' + client_id, 
        {
            "Authorization": access_token
        }
    );

    // Assertion & Validations
    const data = search_resp.data;
    // Respond successfully
    I.assertEqual(data.success, true);
    // Result contain client id equal to search client_id
    I.assertEqual(data.record.id, client_id);
});
