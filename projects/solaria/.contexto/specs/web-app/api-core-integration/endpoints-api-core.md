# Catalogo de endpoints - api-core (QA, extraido de /v3/api-docs em 2026-09-16)

Base URL QA: https://api-core-cqfn.onrender.com (env VITE_API_CORE apos rename). Todo /api/** exige JWT valido (Authorization: Bearer), exceto /v3/api-docs, /swagger-ui/** e POST /dev/login (conveniencia de Swagger, nao usar do front).

## addresses

- GET    `/api/addresses` - Lista todos os endereços cadastrados
- POST   `/api/addresses` - Cria um novo endereço
- DELETE `/api/addresses/{id}` - Exclui um endereço pelo identificador
- GET    `/api/addresses/{id}` - Busca um endereço pelo identificador
- PUT    `/api/addresses/{id}` - Atualiza um endereço existente

## business-contacts

- GET    `/api/business-contacts` - Lista todos os contatos comerciais
- POST   `/api/business-contacts` - Cria um novo contato comercial
- DELETE `/api/business-contacts/{id}` - Remove um contato comercial
- GET    `/api/business-contacts/{id}` - Busca um contato comercial pelo id
- PUT    `/api/business-contacts/{id}` - Atualiza um contato comercial existente

## certification-records

- POST   `/api/certification-records` - Cria um novo registro de certificação
- DELETE `/api/certification-records/{id}` - Remove um registro de certificação pelo id
- GET    `/api/certification-records/{id}` - Busca um registro de certificação pelo id
- PUT    `/api/certification-records/{id}` - Atualiza um registro de certificação existente
- GET    `/api/certification-records/professional-registration/{professionalRegistrationId}` - Lista os registros de certificação de um registro profissional

## certifications

- GET    `/api/certifications` - Lista todas as certificações cadastradas
- POST   `/api/certifications` - Cadastra uma nova certificação
- DELETE `/api/certifications/{id}` - Remove uma certificação pelo identificador
- GET    `/api/certifications/{id}` - Busca uma certificação pelo identificador
- PUT    `/api/certifications/{id}` - Atualiza os dados de uma certificação existente

## charges

- POST   `/api/charges` - Cria uma nova cobrança
- POST   `/api/charges/{id}/cancellation` - Cancela uma cobrança
- GET    `/api/charges/{id}/company/{companyId}` - Busca uma cobrança pelo identificador e empresa
- POST   `/api/charges/{id}/payment` - Registra o pagamento de uma cobrança
- POST   `/api/charges/{id}/refund` - Estorna uma cobrança
- GET    `/api/charges/company/{companyId}` - Lista todas as cobranças de uma empresa
- GET    `/api/charges/subscription/{subscriptionId}` - Lista as cobranças de uma assinatura
- POST   `/api/charges/subscription/{subscriptionId}/generate` - Gera uma cobrança para uma assinatura chamando a procedure sp_generate_subscription_charge

## companies

- GET    `/api/companies` - Lista todas as empresas
- POST   `/api/companies` - Cria uma nova empresa
- DELETE `/api/companies/{id}` - Remove uma empresa
- GET    `/api/companies/{id}` - Busca uma empresa pelo id
- PUT    `/api/companies/{id}` - Atualiza os dados de uma empresa existente
- PATCH  `/api/companies/{id}/address` - Vincula um endereço a uma empresa existente
- PATCH  `/api/companies/{id}/approval` - Aprova o cadastro de uma empresa
- PATCH  `/api/companies/{id}/business-contact` - Vincula um contato comercial a uma empresa existente
- PATCH  `/api/companies/{id}/rejection` - Rejeita o cadastro de uma empresa
- GET    `/api/companies/cnpj/{cnpj}` - Busca uma empresa pelo CNPJ

## company-plans

- GET    `/api/company-plans` - Lista todos os planos de empresa cadastrados
- POST   `/api/company-plans` - Cadastra um novo plano de empresa
- DELETE `/api/company-plans/{id}` - Remove um plano de empresa pelo identificador
- GET    `/api/company-plans/{id}` - Busca um plano de empresa pelo identificador
- PUT    `/api/company-plans/{id}` - Atualiza os dados de um plano de empresa existente

## company-positions

- POST   `/api/company-positions` - Cria um novo vínculo entre empresa e cargo
- DELETE `/api/company-positions/{id}` - Remove um vínculo empresa-cargo pelo id
- GET    `/api/company-positions/{id}/company/{companyId}` - Busca um vínculo empresa-cargo pelo id e pela empresa
- GET    `/api/company-positions/company/{companyId}` - Lista todos os cargos vinculados a uma empresa

## contacts

- GET    `/api/contacts` - Lista todos os contatos cadastrados
- POST   `/api/contacts` - Cria um novo contato
- DELETE `/api/contacts/{id}` - Exclui um contato pelo identificador
- GET    `/api/contacts/{id}` - Busca um contato pelo identificador
- PUT    `/api/contacts/{id}` - Atualiza um contato existente

## energy-bills

- POST   `/api/energy-bills` - Registra uma nova conta de energia
- PUT    `/api/energy-bills/{id}` - Atualiza os dados de uma conta de energia existente
- GET    `/api/energy-bills/{id}/company/{companyId}` - Busca uma conta de energia pelo id e pela empresa
- GET    `/api/energy-bills/local-unit/{localUnitId}` - Lista as contas de energia de uma unidade local

## flux-logs

- POST   `/api/flux-logs` - Registra uma nova ação de usuário
- GET    `/api/flux-logs/user/{userId}` - Lista o histórico de ações de um usuário, mais recente primeiro

## geolocalizations

- POST   `/api/geolocalizations` - Cadastra uma nova geolocalização
- DELETE `/api/geolocalizations/{id}` - Remove uma geolocalização pelo identificador
- GET    `/api/geolocalizations/{id}` - Busca uma geolocalização pelo identificador
- PUT    `/api/geolocalizations/{id}` - Atualiza os dados de uma geolocalização existente
- GET    `/api/geolocalizations/address/{addressId}` - Lista as geolocalizações vinculadas a um endereço

## inventories

- POST   `/api/inventories` - Cria um novo item de estoque
- DELETE `/api/inventories/{id}` - Remove um item de estoque pelo id
- GET    `/api/inventories/{id}/company/{companyId}` - Busca um item de estoque pelo id e pela empresa
- PATCH  `/api/inventories/{id}/quantity` - Atualiza a quantidade de um item de estoque
- GET    `/api/inventories/company/{companyId}` - Lista todos os itens de estoque de uma empresa
- GET    `/api/inventories/supplier/{supplierId}` - Lista os itens de estoque de um fornecedor

## local-units

- POST   `/api/local-units` - Cria uma nova unidade local
- DELETE `/api/local-units/{id}` - Exclui uma unidade local pelo identificador
- PUT    `/api/local-units/{id}` - Atualiza uma unidade local existente
- PATCH  `/api/local-units/{id}/address` - Vincula um endereço a uma unidade local
- GET    `/api/local-units/{id}/company/{companyId}` - Busca uma unidade local pelo identificador e empresa
- GET    `/api/local-units/company/{companyId}` - Lista todas as unidades locais de uma empresa
- GET    `/api/local-units/requester/{requesterId}` - Lista as unidades locais de um solicitante

## login

- POST   `/dev/login` - Autentica em api-auth e devolve o JWT, para colar no botão Authorize deste Swagger

## models

- GET    `/api/models` - Lista todos os modelos
- POST   `/api/models` - Cria um novo modelo
- DELETE `/api/models/{id}` - Remove um modelo
- GET    `/api/models/{id}` - Busca um modelo pelo id
- PUT    `/api/models/{id}` - Atualiza um modelo existente
- POST   `/api/models/{id}/approval` - Aprova um modelo
- POST   `/api/models/{id}/rejection` - Rejeita um modelo
- GET    `/api/models/status/{status}` - Lista os modelos filtrados por status

## offers

- POST   `/api/offers` - Cadastra uma nova oferta
- DELETE `/api/offers/{id}` - Remove uma oferta pelo identificador
- PUT    `/api/offers/{id}` - Atualiza os dados de uma oferta existente
- GET    `/api/offers/{id}/company/{companyId}` - Busca uma oferta pelo identificador, escopada à empresa
- GET    `/api/offers/catalog` - Lista o catálogo público de ofertas vigentes
- GET    `/api/offers/company/{companyId}` - Lista todas as ofertas de uma empresa
- GET    `/api/offers/supplier/{supplierId}` - Lista as ofertas cadastradas por um fornecedor

## permissions

- GET    `/api/permissions` - Lista todas as permissões cadastradas
- POST   `/api/permissions` - Cria uma nova permissão
- DELETE `/api/permissions/{id}` - Remove uma permissão pelo id
- GET    `/api/permissions/{id}` - Busca uma permissão pelo id
- PUT    `/api/permissions/{id}` - Atualiza uma permissão existente

## persons

- GET    `/api/persons` - Lista todas as pessoas cadastradas
- POST   `/api/persons` - Cria uma nova pessoa
- DELETE `/api/persons/{id}` - Exclui uma pessoa pelo identificador
- GET    `/api/persons/{id}` - Busca uma pessoa pelo identificador
- PUT    `/api/persons/{id}` - Atualiza uma pessoa existente

## ping

- GET    `/internal/ping` - ping

## position-permissions

- POST   `/api/position-permissions` - Concede uma permissão a um cargo
- DELETE `/api/position-permissions/{id}` - Revoga uma permissão concedida a um cargo
- GET    `/api/position-permissions/position/{positionId}` - Lista as permissões concedidas a um cargo

## positions

- GET    `/api/positions` - Lista todos os cargos
- POST   `/api/positions` - Cria um novo cargo
- DELETE `/api/positions/{id}` - Remove um cargo
- GET    `/api/positions/{id}` - Busca um cargo pelo id
- PUT    `/api/positions/{id}` - Atualiza um cargo existente

## professional-registrations

- POST   `/api/professional-registrations` - Cria um novo registro profissional
- DELETE `/api/professional-registrations/{id}` - Exclui um registro profissional pelo identificador
- GET    `/api/professional-registrations/{id}` - Busca um registro profissional pelo identificador
- PUT    `/api/professional-registrations/{id}` - Atualiza um registro profissional existente
- GET    `/api/professional-registrations/technician/{technicianId}` - Lista os registros profissionais de um técnico

## professional-reviews

- POST   `/api/professional-reviews` - Cria uma nova avaliação de profissional
- GET    `/api/professional-reviews/{id}` - Busca uma avaliação de profissional pelo id
- PATCH  `/api/professional-reviews/{id}/deactivation` - Desativa uma avaliação de profissional
- GET    `/api/professional-reviews/professional/{professionalId}` - Lista as avaliações de um profissional

## professions

- GET    `/api/professions` - Lista todas as profissões cadastradas
- POST   `/api/professions` - Cria uma nova profissão
- DELETE `/api/professions/{id}` - Remove uma profissão pelo id
- GET    `/api/professions/{id}` - Busca uma profissão pelo id
- PUT    `/api/professions/{id}` - Atualiza uma profissão existente

## proposal-items

- POST   `/api/proposal-items` - Cria um novo item de proposta
- DELETE `/api/proposal-items/{id}` - Remove um item de proposta pelo id
- PUT    `/api/proposal-items/{id}` - Atualiza um item de proposta existente
- GET    `/api/proposal-items/{id}/company/{companyId}` - Busca um item de proposta pelo id e pela empresa
- GET    `/api/proposal-items/proposal/{proposalId}` - Lista os itens de uma proposta

## proposal-units

- POST   `/api/proposal-units` - Cria uma nova unidade de proposta
- DELETE `/api/proposal-units/{id}` - Exclui uma unidade de proposta pelo identificador
- PUT    `/api/proposal-units/{id}` - Atualiza uma unidade de proposta existente
- GET    `/api/proposal-units/{id}/company/{companyId}` - Busca uma unidade de proposta pelo identificador e empresa
- GET    `/api/proposal-units/proposal-item/{proposalItemId}` - Lista as unidades de um item de proposta

## proposals

- POST   `/api/proposals` - Cria uma nova proposta comercial
- POST   `/api/proposals/{id}/cancellation` - Cancela a proposta antes da conclusão da negociação
- GET    `/api/proposals/{id}/company/{companyId}` - Busca uma proposta pelo identificador, escopada à empresa
- PATCH  `/api/proposals/{id}/notes` - Atualiza as observações (notes) internas da proposta
- POST   `/api/proposals/{id}/rejection` - Rejeita a proposta, encerrando a negociação sem acordo entre as partes
- POST   `/api/proposals/{id}/requester-agreement` - Registra a concordância do solicitante com os termos vigentes da proposta
- POST   `/api/proposals/{id}/requester-counter` - Registra uma contraproposta enviada pelo solicitante
- POST   `/api/proposals/{id}/supplier-agreement` - Registra a concordância do fornecedor com os termos vigentes da proposta
- POST   `/api/proposals/{id}/supplier-counter` - Registra uma contraproposta enviada pelo fornecedor
- GET    `/api/proposals/company/{companyId}` - Lista todas as propostas de uma empresa
- GET    `/api/proposals/requester/{requesterId}` - Lista as propostas associadas a um solicitante

## requesters

- POST   `/api/requesters` - Cria um novo solicitante
- DELETE `/api/requesters/{id}` - Remove um solicitante
- GET    `/api/requesters/{id}/company/{companyId}` - Busca um solicitante pelo id e pela empresa
- GET    `/api/requesters/company/{companyId}` - Lista os solicitantes de uma empresa

## service-contracts

- POST   `/api/service-contracts` - Cria um novo contrato de serviço
- PUT    `/api/service-contracts/{id}` - Atualiza os dados de um contrato de serviço existente
- GET    `/api/service-contracts/{id}/company/{companyId}` - Busca um contrato de serviço pelo identificador, escopado à empresa
- PATCH  `/api/service-contracts/{id}/utility-approval` - Marca o contrato como aprovado pela concessionária de energia
- GET    `/api/service-contracts/service/{serviceId}` - Busca o contrato de serviço vinculado a um serviço

## service-executors

- POST   `/api/service-executors` - Cria um novo executor de serviço
- DELETE `/api/service-executors/{id}` - Remove um executor de serviço pelo id
- PATCH  `/api/service-executors/{id}/function` - Atualiza a função de um executor de serviço
- GET    `/api/service-executors/service/{serviceId}` - Lista os executores de um serviço

## service-tokens

- POST   `/internal/service-tokens` - mint
- POST   `/internal/service-tokens/refresh` - refresh

## shifts

- POST   `/api/shifts` - Cria um novo turno
- DELETE `/api/shifts/{id}` - Remove um turno
- GET    `/api/shifts/{id}` - Busca um turno pelo id
- PUT    `/api/shifts/{id}` - Atualiza um turno existente
- GET    `/api/shifts/technician/{technicianId}` - Lista os turnos de um técnico

## subscriptions

- POST   `/api/subscriptions` - Cria uma nova assinatura
- GET    `/api/subscriptions/{id}/company/{companyId}` - Busca uma assinatura pelo identificador e empresa
- POST   `/api/subscriptions/{id}/end` - Encerra uma assinatura
- POST   `/api/subscriptions/{id}/in-debt` - Marca uma assinatura como inadimplente
- POST   `/api/subscriptions/{id}/reactivation` - Reativa uma assinatura suspensa
- POST   `/api/subscriptions/{id}/suspension` - Suspende uma assinatura
- GET    `/api/subscriptions/company/{companyId}` - Lista todas as assinaturas de uma empresa
- GET    `/api/subscriptions/supplier/{supplierId}` - Lista as assinaturas de um fornecedor

## suppliers

- POST   `/api/suppliers` - Cria um novo fornecedor
- POST   `/api/suppliers/{id}/activation` - Ativa um fornecedor
- GET    `/api/suppliers/{id}/company/{companyId}` - Busca um fornecedor pelo id e pela empresa
- POST   `/api/suppliers/{id}/deactivation` - Desativa um fornecedor
- POST   `/api/suppliers/{id}/suspension` - Suspende um fornecedor
- GET    `/api/suppliers/company/{companyId}` - Lista os fornecedores de uma empresa
- POST   `/api/suppliers/search` - Pesquisa fornecedores

## technical-courses

- POST   `/api/technical-courses` - Cria um novo curso técnico
- DELETE `/api/technical-courses/{id}` - Remove um curso técnico pelo id
- PUT    `/api/technical-courses/{id}` - Atualiza um curso técnico existente
- GET    `/api/technical-courses/{id}/company/{companyId}` - Busca um curso técnico pelo id e pela empresa
- GET    `/api/technical-courses/company/{companyId}` - Lista os cursos técnicos de uma empresa

## technical-projects

- POST   `/api/technical-projects` - Cria um novo projeto técnico
- DELETE `/api/technical-projects/{id}` - Exclui um projeto técnico pelo identificador
- PUT    `/api/technical-projects/{id}` - Atualiza um projeto técnico existente
- GET    `/api/technical-projects/{id}/company/{companyId}` - Busca um projeto técnico pelo identificador e empresa
- GET    `/api/technical-projects/company/{companyId}` - Lista todos os projetos técnicos de uma empresa
- GET    `/api/technical-projects/requester/{requesterId}` - Lista os projetos técnicos de um solicitante

## technical-services

- POST   `/api/technical-services` - Cria um novo serviço técnico
- POST   `/api/technical-services/{id}/acceptance` - Registra o aceite de um serviço técnico
- POST   `/api/technical-services/{id}/cancellation` - Cancela um serviço técnico
- GET    `/api/technical-services/{id}/company/{companyId}` - Busca um serviço técnico pelo id e pela empresa
- POST   `/api/technical-services/{id}/completion` - Conclui um serviço técnico
- PATCH  `/api/technical-services/{id}/purpose` - Atualiza a finalidade de um serviço técnico
- PATCH  `/api/technical-services/{id}/schedule` - Reagenda a data de um serviço técnico
- GET    `/api/technical-services/company/{companyId}` - Lista os serviços técnicos de uma empresa
- GET    `/api/technical-services/technical-project/{technicalProjectId}` - Lista os serviços técnicos de um projeto técnico

## technician-affiliations

- POST   `/api/technician-affiliations` - Cria uma nova afiliação de técnico
- PATCH  `/api/technician-affiliations/{id}/active` - Ativa ou desativa uma afiliação de técnico
- GET    `/api/technician-affiliations/{id}/company/{companyId}` - Busca uma afiliação de técnico pelo id e pela empresa
- PATCH  `/api/technician-affiliations/{id}/type` - Atualiza o tipo de uma afiliação de técnico
- GET    `/api/technician-affiliations/company/{companyId}` - Lista todas as afiliações de técnicos de uma empresa
- GET    `/api/technician-affiliations/technician/{technicianId}` - Lista as afiliações de um técnico

## technicians

- GET    `/api/technicians` - Lista todos os técnicos cadastrados
- POST   `/api/technicians` - Cadastra um novo técnico
- DELETE `/api/technicians/{id}` - Remove um técnico pelo identificador
- GET    `/api/technicians/{id}` - Busca um técnico pelo identificador
- PUT    `/api/technicians/{id}` - Atualiza os dados de um técnico existente

## unit-specifications

- POST   `/api/unit-specifications` - Cria um novo registro de especificação de unidade
- GET    `/api/unit-specifications/{id}/company/{companyId}` - Busca uma especificação de unidade pelo identificador e empresa
- GET    `/api/unit-specifications/local-unit/{localUnitId}` - Lista o histórico de especificações de uma unidade local

## user-companies

- POST   `/api/user-companies` - Vincula um usuário a uma empresa
- DELETE `/api/user-companies/{id}` - Remove o vínculo entre um usuário e uma empresa
- GET    `/api/user-companies/{id}/company/{companyId}` - Busca um vínculo usuário-empresa pelo identificador, escopado à empresa
- PATCH  `/api/user-companies/{id}/position` - Atualiza o cargo (position) associado ao vínculo usuário-empresa
- GET    `/api/user-companies/company/{companyId}` - Lista os vínculos de usuários de uma empresa
- GET    `/api/user-companies/user/{userId}` - Lista os vínculos de empresas de um usuário

## users

- GET    `/api/users` - Lista todos os usuários
- POST   `/api/users` - Cria um novo usuário
- DELETE `/api/users/{id}` - Remove um usuário
- GET    `/api/users/{id}` - Busca um usuário pelo id
- PUT    `/api/users/{id}` - Atualiza um usuário existente
- POST   `/internal/users` - provision

