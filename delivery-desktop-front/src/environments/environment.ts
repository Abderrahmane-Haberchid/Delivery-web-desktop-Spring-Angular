export const environment = {
    production: false,
    keycloak: {
        url: 'http://localhost:8888',
        realm: 'delivery-manager',
        clientId: 'delivery-client',
    },
}

//Docker environment

// export const environment = {
//     production: false,
//     keycloak: {
//         url: '${KEYCLOAK_URL}',
//         realm: '${KEYCLOAK_REALM}',
//         clientId: '${KEYCLOAK_CLIENT_ID}',
//     },
// }