-- Seed file for RoyalPets.nl
-- Inserts the 8 royal costumes

INSERT INTO costumes (slug, name_nl, name_en, category, description_nl, description_en, prompt_template, sort_order, is_active)
VALUES 
(
    'koning',
    'De Koning',
    'The King',
    'koninklijk',
    'Een majestueuze koning met gouden kroon en hermelijnen mantel. Perfect voor de trotse leider van het huis.',
    'A majestic king with golden crown and ermine robe. Perfect for the proud leader of the house.',
    'A royal portrait of a {pet_type} dressed as a magnificent king, wearing a golden crown with jewels, luxurious ermine-trimmed red velvet robe, holding a golden scepter. Baroque palace background with rich drapery. Oil painting style, Rembrandt lighting, highly detailed, regal pose.',
    1,
    true
),
(
    'koningin',
    'De Koningin',
    'The Queen',
    'koninklijk',
    'Een elegante koningin met fonkelende tiara en fluwelen gewaad. Voor de koninklijke dame van het gezin.',
    'An elegant queen with sparkling tiara and velvet gown. For the royal lady of the family.',
    'A royal portrait of a {pet_type} dressed as a beautiful queen, wearing a diamond tiara, luxurious velvet gown in deep purple or blue, pearl necklace. Baroque palace background with ornate details. Oil painting style, soft lighting, highly detailed, graceful pose.',
    2,
    true
),
(
    'ridder',
    'De Ridder',
    'The Knight',
    'militair',
    'Een dappere ridder in glanzend harnas met zwaard. Voor de beschermer van het rijk.',
    'A brave knight in shining armor with sword. For the protector of the realm.',
    'A heroic portrait of a {pet_type} dressed as a medieval knight, wearing shining plate armor, chainmail, holding a gleaming sword. Castle hall background with stone walls and tapestries. Oil painting style, dramatic lighting, highly detailed, noble stance.',
    3,
    true
),
(
    'admiraal',
    'De Admiraal',
    'The Admiral',
    'militair',
    'Een stoere admiraal in marine-uniform met medailles. Voor de kapitein van het schip.',
    'A sturdy admiral in naval uniform with medals. For the captain of the ship.',
    'A distinguished portrait of a {pet_type} dressed as a naval admiral, wearing a dark blue uniform with gold epaulettes, rows of medals, bicorne hat. Ship cabin background with nautical instruments and maps. Oil painting style, warm lighting, highly detailed, authoritative pose.',
    4,
    true
),
(
    'hertog',
    'De Hertog',
    'The Duke',
    'renaissance',
    'Een verfijnde hertog in barok jasje met scepter. Voor de aristocraat met klasse.',
    'A refined duke in baroque coat with scepter. For the aristocrat with class.',
    'An aristocratic portrait of a {pet_type} dressed as a baroque duke, wearing an elaborate coat with gold embroidery, lace collar, holding a scepter. Grand hall background with classical architecture. Oil painting style, dramatic chiaroscuro, highly detailed, dignified pose.',
    5,
    true
),
(
    'gravin',
    'De Gravin',
    'The Countess',
    'renaissance',
    'Een statige gravin in Elizabethaanse jurk met parels. Voor de adellijke dame met allure.',
    'A stately countess in Elizabethan dress with pearls. For the noble lady with allure.',
    'A noble portrait of a {pet_type} dressed as an Elizabethan countess, wearing an elaborate gown with ruffled collar, pearl necklace and earrings, jeweled headpiece. Tudor palace background. Oil painting style, soft diffused lighting, highly detailed, elegant pose.',
    6,
    true
),
(
    'generaal',
    'De Generaal',
    'The General',
    'militair',
    'Een imposante generaal in ceremonieel uniform. Voor de commandant die respect afdwingt.',
    'An imposing general in ceremonial uniform. For the commander who demands respect.',
    'A commanding portrait of a {pet_type} dressed as a military general, wearing a decorated dress uniform with medals, gold braid, epaulettes, cap with visor. Military headquarters background with flags. Oil painting style, strong directional lighting, highly detailed, commanding pose.',
    7,
    true
),
(
    'prinses',
    'De Prinses',
    'The Princess',
    'koninklijk',
    'Een charmante prinses in roze gewaad met kleine kroon. Voor de lieveling van het paleis.',
    'A charming princess in pink gown with small crown. For the palace favorite.',
    'A delightful portrait of a {pet_type} dressed as a sweet princess, wearing a pink or lavender gown with delicate details, small tiara or crown, ribbon collar. Fairy tale castle background with flowers. Oil painting style, soft romantic lighting, highly detailed, charming pose.',
    8,
    true
);
