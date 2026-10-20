-- Retire toute balise <pre ...>, </pre>, <code ...>, </code> (quels que soient
-- les attributs et la casse) des champs texte. Complète la migration
-- 20261019154000 qui ne traitait que <pre> et <code class="language-json">.
-- SQLite n'ayant pas de regexp_replace, on retire une balise par itération
-- via une CTE récursive, puis on garde la dernière version sans balise.

-- dialogue_lines.text
WITH RECURSIVE cleaned(id, v) AS (
  SELECT id, text FROM dialogue_lines WHERE text IS NOT NULL AND (instr(lower(text), '<pre') > 0 OR instr(lower(text), '</pre') > 0 OR instr(lower(text), '<code') > 0 OR instr(lower(text), '</code') > 0)
  UNION ALL
  SELECT id, CASE
    WHEN instr(lower(v), '<code') > 0 THEN substr(v, 1, instr(lower(v), '<code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<code')), '>') > 0 THEN substr(v, instr(lower(v), '<code') + instr(substr(v, instr(lower(v), '<code')), '>')) ELSE substr(v, instr(lower(v), '<code') + 5) END
    WHEN instr(lower(v), '</code') > 0 THEN substr(v, 1, instr(lower(v), '</code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</code')), '>') > 0 THEN substr(v, instr(lower(v), '</code') + instr(substr(v, instr(lower(v), '</code')), '>')) ELSE substr(v, instr(lower(v), '</code') + 6) END
    WHEN instr(lower(v), '<pre') > 0 THEN substr(v, 1, instr(lower(v), '<pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<pre')), '>') > 0 THEN substr(v, instr(lower(v), '<pre') + instr(substr(v, instr(lower(v), '<pre')), '>')) ELSE substr(v, instr(lower(v), '<pre') + 4) END
    WHEN instr(lower(v), '</pre') > 0 THEN substr(v, 1, instr(lower(v), '</pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</pre')), '>') > 0 THEN substr(v, instr(lower(v), '</pre') + instr(substr(v, instr(lower(v), '</pre')), '>')) ELSE substr(v, instr(lower(v), '</pre') + 5) END
  END
  FROM cleaned WHERE instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0
)
UPDATE dialogue_lines SET text = (
  SELECT v FROM cleaned WHERE cleaned.id = dialogue_lines.id AND NOT (instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0)
)
WHERE id IN (SELECT id FROM cleaned);

-- dialogue_choices.text
WITH RECURSIVE cleaned(id, v) AS (
  SELECT id, text FROM dialogue_choices WHERE text IS NOT NULL AND (instr(lower(text), '<pre') > 0 OR instr(lower(text), '</pre') > 0 OR instr(lower(text), '<code') > 0 OR instr(lower(text), '</code') > 0)
  UNION ALL
  SELECT id, CASE
    WHEN instr(lower(v), '<code') > 0 THEN substr(v, 1, instr(lower(v), '<code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<code')), '>') > 0 THEN substr(v, instr(lower(v), '<code') + instr(substr(v, instr(lower(v), '<code')), '>')) ELSE substr(v, instr(lower(v), '<code') + 5) END
    WHEN instr(lower(v), '</code') > 0 THEN substr(v, 1, instr(lower(v), '</code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</code')), '>') > 0 THEN substr(v, instr(lower(v), '</code') + instr(substr(v, instr(lower(v), '</code')), '>')) ELSE substr(v, instr(lower(v), '</code') + 6) END
    WHEN instr(lower(v), '<pre') > 0 THEN substr(v, 1, instr(lower(v), '<pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<pre')), '>') > 0 THEN substr(v, instr(lower(v), '<pre') + instr(substr(v, instr(lower(v), '<pre')), '>')) ELSE substr(v, instr(lower(v), '<pre') + 4) END
    WHEN instr(lower(v), '</pre') > 0 THEN substr(v, 1, instr(lower(v), '</pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</pre')), '>') > 0 THEN substr(v, instr(lower(v), '</pre') + instr(substr(v, instr(lower(v), '</pre')), '>')) ELSE substr(v, instr(lower(v), '</pre') + 5) END
  END
  FROM cleaned WHERE instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0
)
UPDATE dialogue_choices SET text = (
  SELECT v FROM cleaned WHERE cleaned.id = dialogue_choices.id AND NOT (instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0)
)
WHERE id IN (SELECT id FROM cleaned);

-- dialogues.description
WITH RECURSIVE cleaned(id, v) AS (
  SELECT id, description FROM dialogues WHERE description IS NOT NULL AND (instr(lower(description), '<pre') > 0 OR instr(lower(description), '</pre') > 0 OR instr(lower(description), '<code') > 0 OR instr(lower(description), '</code') > 0)
  UNION ALL
  SELECT id, CASE
    WHEN instr(lower(v), '<code') > 0 THEN substr(v, 1, instr(lower(v), '<code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<code')), '>') > 0 THEN substr(v, instr(lower(v), '<code') + instr(substr(v, instr(lower(v), '<code')), '>')) ELSE substr(v, instr(lower(v), '<code') + 5) END
    WHEN instr(lower(v), '</code') > 0 THEN substr(v, 1, instr(lower(v), '</code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</code')), '>') > 0 THEN substr(v, instr(lower(v), '</code') + instr(substr(v, instr(lower(v), '</code')), '>')) ELSE substr(v, instr(lower(v), '</code') + 6) END
    WHEN instr(lower(v), '<pre') > 0 THEN substr(v, 1, instr(lower(v), '<pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<pre')), '>') > 0 THEN substr(v, instr(lower(v), '<pre') + instr(substr(v, instr(lower(v), '<pre')), '>')) ELSE substr(v, instr(lower(v), '<pre') + 4) END
    WHEN instr(lower(v), '</pre') > 0 THEN substr(v, 1, instr(lower(v), '</pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</pre')), '>') > 0 THEN substr(v, instr(lower(v), '</pre') + instr(substr(v, instr(lower(v), '</pre')), '>')) ELSE substr(v, instr(lower(v), '</pre') + 5) END
  END
  FROM cleaned WHERE instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0
)
UPDATE dialogues SET description = (
  SELECT v FROM cleaned WHERE cleaned.id = dialogues.id AND NOT (instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0)
)
WHERE id IN (SELECT id FROM cleaned);

-- sms_messages.text
WITH RECURSIVE cleaned(id, v) AS (
  SELECT id, text FROM sms_messages WHERE text IS NOT NULL AND (instr(lower(text), '<pre') > 0 OR instr(lower(text), '</pre') > 0 OR instr(lower(text), '<code') > 0 OR instr(lower(text), '</code') > 0)
  UNION ALL
  SELECT id, CASE
    WHEN instr(lower(v), '<code') > 0 THEN substr(v, 1, instr(lower(v), '<code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<code')), '>') > 0 THEN substr(v, instr(lower(v), '<code') + instr(substr(v, instr(lower(v), '<code')), '>')) ELSE substr(v, instr(lower(v), '<code') + 5) END
    WHEN instr(lower(v), '</code') > 0 THEN substr(v, 1, instr(lower(v), '</code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</code')), '>') > 0 THEN substr(v, instr(lower(v), '</code') + instr(substr(v, instr(lower(v), '</code')), '>')) ELSE substr(v, instr(lower(v), '</code') + 6) END
    WHEN instr(lower(v), '<pre') > 0 THEN substr(v, 1, instr(lower(v), '<pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<pre')), '>') > 0 THEN substr(v, instr(lower(v), '<pre') + instr(substr(v, instr(lower(v), '<pre')), '>')) ELSE substr(v, instr(lower(v), '<pre') + 4) END
    WHEN instr(lower(v), '</pre') > 0 THEN substr(v, 1, instr(lower(v), '</pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</pre')), '>') > 0 THEN substr(v, instr(lower(v), '</pre') + instr(substr(v, instr(lower(v), '</pre')), '>')) ELSE substr(v, instr(lower(v), '</pre') + 5) END
  END
  FROM cleaned WHERE instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0
)
UPDATE sms_messages SET text = (
  SELECT v FROM cleaned WHERE cleaned.id = sms_messages.id AND NOT (instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0)
)
WHERE id IN (SELECT id FROM cleaned);

-- sms_messages.shortContent
WITH RECURSIVE cleaned(id, v) AS (
  SELECT id, shortContent FROM sms_messages WHERE shortContent IS NOT NULL AND (instr(lower(shortContent), '<pre') > 0 OR instr(lower(shortContent), '</pre') > 0 OR instr(lower(shortContent), '<code') > 0 OR instr(lower(shortContent), '</code') > 0)
  UNION ALL
  SELECT id, CASE
    WHEN instr(lower(v), '<code') > 0 THEN substr(v, 1, instr(lower(v), '<code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<code')), '>') > 0 THEN substr(v, instr(lower(v), '<code') + instr(substr(v, instr(lower(v), '<code')), '>')) ELSE substr(v, instr(lower(v), '<code') + 5) END
    WHEN instr(lower(v), '</code') > 0 THEN substr(v, 1, instr(lower(v), '</code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</code')), '>') > 0 THEN substr(v, instr(lower(v), '</code') + instr(substr(v, instr(lower(v), '</code')), '>')) ELSE substr(v, instr(lower(v), '</code') + 6) END
    WHEN instr(lower(v), '<pre') > 0 THEN substr(v, 1, instr(lower(v), '<pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<pre')), '>') > 0 THEN substr(v, instr(lower(v), '<pre') + instr(substr(v, instr(lower(v), '<pre')), '>')) ELSE substr(v, instr(lower(v), '<pre') + 4) END
    WHEN instr(lower(v), '</pre') > 0 THEN substr(v, 1, instr(lower(v), '</pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</pre')), '>') > 0 THEN substr(v, instr(lower(v), '</pre') + instr(substr(v, instr(lower(v), '</pre')), '>')) ELSE substr(v, instr(lower(v), '</pre') + 5) END
  END
  FROM cleaned WHERE instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0
)
UPDATE sms_messages SET shortContent = (
  SELECT v FROM cleaned WHERE cleaned.id = sms_messages.id AND NOT (instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0)
)
WHERE id IN (SELECT id FROM cleaned);

-- sms_questions.content
WITH RECURSIVE cleaned(id, v) AS (
  SELECT id, content FROM sms_questions WHERE content IS NOT NULL AND (instr(lower(content), '<pre') > 0 OR instr(lower(content), '</pre') > 0 OR instr(lower(content), '<code') > 0 OR instr(lower(content), '</code') > 0)
  UNION ALL
  SELECT id, CASE
    WHEN instr(lower(v), '<code') > 0 THEN substr(v, 1, instr(lower(v), '<code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<code')), '>') > 0 THEN substr(v, instr(lower(v), '<code') + instr(substr(v, instr(lower(v), '<code')), '>')) ELSE substr(v, instr(lower(v), '<code') + 5) END
    WHEN instr(lower(v), '</code') > 0 THEN substr(v, 1, instr(lower(v), '</code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</code')), '>') > 0 THEN substr(v, instr(lower(v), '</code') + instr(substr(v, instr(lower(v), '</code')), '>')) ELSE substr(v, instr(lower(v), '</code') + 6) END
    WHEN instr(lower(v), '<pre') > 0 THEN substr(v, 1, instr(lower(v), '<pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<pre')), '>') > 0 THEN substr(v, instr(lower(v), '<pre') + instr(substr(v, instr(lower(v), '<pre')), '>')) ELSE substr(v, instr(lower(v), '<pre') + 4) END
    WHEN instr(lower(v), '</pre') > 0 THEN substr(v, 1, instr(lower(v), '</pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</pre')), '>') > 0 THEN substr(v, instr(lower(v), '</pre') + instr(substr(v, instr(lower(v), '</pre')), '>')) ELSE substr(v, instr(lower(v), '</pre') + 5) END
  END
  FROM cleaned WHERE instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0
)
UPDATE sms_questions SET content = (
  SELECT v FROM cleaned WHERE cleaned.id = sms_questions.id AND NOT (instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0)
)
WHERE id IN (SELECT id FROM cleaned);

-- sms_answers.content
WITH RECURSIVE cleaned(id, v) AS (
  SELECT id, content FROM sms_answers WHERE content IS NOT NULL AND (instr(lower(content), '<pre') > 0 OR instr(lower(content), '</pre') > 0 OR instr(lower(content), '<code') > 0 OR instr(lower(content), '</code') > 0)
  UNION ALL
  SELECT id, CASE
    WHEN instr(lower(v), '<code') > 0 THEN substr(v, 1, instr(lower(v), '<code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<code')), '>') > 0 THEN substr(v, instr(lower(v), '<code') + instr(substr(v, instr(lower(v), '<code')), '>')) ELSE substr(v, instr(lower(v), '<code') + 5) END
    WHEN instr(lower(v), '</code') > 0 THEN substr(v, 1, instr(lower(v), '</code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</code')), '>') > 0 THEN substr(v, instr(lower(v), '</code') + instr(substr(v, instr(lower(v), '</code')), '>')) ELSE substr(v, instr(lower(v), '</code') + 6) END
    WHEN instr(lower(v), '<pre') > 0 THEN substr(v, 1, instr(lower(v), '<pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<pre')), '>') > 0 THEN substr(v, instr(lower(v), '<pre') + instr(substr(v, instr(lower(v), '<pre')), '>')) ELSE substr(v, instr(lower(v), '<pre') + 4) END
    WHEN instr(lower(v), '</pre') > 0 THEN substr(v, 1, instr(lower(v), '</pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</pre')), '>') > 0 THEN substr(v, instr(lower(v), '</pre') + instr(substr(v, instr(lower(v), '</pre')), '>')) ELSE substr(v, instr(lower(v), '</pre') + 5) END
  END
  FROM cleaned WHERE instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0
)
UPDATE sms_answers SET content = (
  SELECT v FROM cleaned WHERE cleaned.id = sms_answers.id AND NOT (instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0)
)
WHERE id IN (SELECT id FROM cleaned);

-- sms_answers.shortContent
WITH RECURSIVE cleaned(id, v) AS (
  SELECT id, shortContent FROM sms_answers WHERE shortContent IS NOT NULL AND (instr(lower(shortContent), '<pre') > 0 OR instr(lower(shortContent), '</pre') > 0 OR instr(lower(shortContent), '<code') > 0 OR instr(lower(shortContent), '</code') > 0)
  UNION ALL
  SELECT id, CASE
    WHEN instr(lower(v), '<code') > 0 THEN substr(v, 1, instr(lower(v), '<code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<code')), '>') > 0 THEN substr(v, instr(lower(v), '<code') + instr(substr(v, instr(lower(v), '<code')), '>')) ELSE substr(v, instr(lower(v), '<code') + 5) END
    WHEN instr(lower(v), '</code') > 0 THEN substr(v, 1, instr(lower(v), '</code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</code')), '>') > 0 THEN substr(v, instr(lower(v), '</code') + instr(substr(v, instr(lower(v), '</code')), '>')) ELSE substr(v, instr(lower(v), '</code') + 6) END
    WHEN instr(lower(v), '<pre') > 0 THEN substr(v, 1, instr(lower(v), '<pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<pre')), '>') > 0 THEN substr(v, instr(lower(v), '<pre') + instr(substr(v, instr(lower(v), '<pre')), '>')) ELSE substr(v, instr(lower(v), '<pre') + 4) END
    WHEN instr(lower(v), '</pre') > 0 THEN substr(v, 1, instr(lower(v), '</pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</pre')), '>') > 0 THEN substr(v, instr(lower(v), '</pre') + instr(substr(v, instr(lower(v), '</pre')), '>')) ELSE substr(v, instr(lower(v), '</pre') + 5) END
  END
  FROM cleaned WHERE instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0
)
UPDATE sms_answers SET shortContent = (
  SELECT v FROM cleaned WHERE cleaned.id = sms_answers.id AND NOT (instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0)
)
WHERE id IN (SELECT id FROM cleaned);

-- sms_answers.cpuResponse
WITH RECURSIVE cleaned(id, v) AS (
  SELECT id, cpuResponse FROM sms_answers WHERE cpuResponse IS NOT NULL AND (instr(lower(cpuResponse), '<pre') > 0 OR instr(lower(cpuResponse), '</pre') > 0 OR instr(lower(cpuResponse), '<code') > 0 OR instr(lower(cpuResponse), '</code') > 0)
  UNION ALL
  SELECT id, CASE
    WHEN instr(lower(v), '<code') > 0 THEN substr(v, 1, instr(lower(v), '<code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<code')), '>') > 0 THEN substr(v, instr(lower(v), '<code') + instr(substr(v, instr(lower(v), '<code')), '>')) ELSE substr(v, instr(lower(v), '<code') + 5) END
    WHEN instr(lower(v), '</code') > 0 THEN substr(v, 1, instr(lower(v), '</code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</code')), '>') > 0 THEN substr(v, instr(lower(v), '</code') + instr(substr(v, instr(lower(v), '</code')), '>')) ELSE substr(v, instr(lower(v), '</code') + 6) END
    WHEN instr(lower(v), '<pre') > 0 THEN substr(v, 1, instr(lower(v), '<pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<pre')), '>') > 0 THEN substr(v, instr(lower(v), '<pre') + instr(substr(v, instr(lower(v), '<pre')), '>')) ELSE substr(v, instr(lower(v), '<pre') + 4) END
    WHEN instr(lower(v), '</pre') > 0 THEN substr(v, 1, instr(lower(v), '</pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</pre')), '>') > 0 THEN substr(v, instr(lower(v), '</pre') + instr(substr(v, instr(lower(v), '</pre')), '>')) ELSE substr(v, instr(lower(v), '</pre') + 5) END
  END
  FROM cleaned WHERE instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0
)
UPDATE sms_answers SET cpuResponse = (
  SELECT v FROM cleaned WHERE cleaned.id = sms_answers.id AND NOT (instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0)
)
WHERE id IN (SELECT id FROM cleaned);

-- journal_entries.content
WITH RECURSIVE cleaned(id, v) AS (
  SELECT id, content FROM journal_entries WHERE content IS NOT NULL AND (instr(lower(content), '<pre') > 0 OR instr(lower(content), '</pre') > 0 OR instr(lower(content), '<code') > 0 OR instr(lower(content), '</code') > 0)
  UNION ALL
  SELECT id, CASE
    WHEN instr(lower(v), '<code') > 0 THEN substr(v, 1, instr(lower(v), '<code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<code')), '>') > 0 THEN substr(v, instr(lower(v), '<code') + instr(substr(v, instr(lower(v), '<code')), '>')) ELSE substr(v, instr(lower(v), '<code') + 5) END
    WHEN instr(lower(v), '</code') > 0 THEN substr(v, 1, instr(lower(v), '</code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</code')), '>') > 0 THEN substr(v, instr(lower(v), '</code') + instr(substr(v, instr(lower(v), '</code')), '>')) ELSE substr(v, instr(lower(v), '</code') + 6) END
    WHEN instr(lower(v), '<pre') > 0 THEN substr(v, 1, instr(lower(v), '<pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<pre')), '>') > 0 THEN substr(v, instr(lower(v), '<pre') + instr(substr(v, instr(lower(v), '<pre')), '>')) ELSE substr(v, instr(lower(v), '<pre') + 4) END
    WHEN instr(lower(v), '</pre') > 0 THEN substr(v, 1, instr(lower(v), '</pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</pre')), '>') > 0 THEN substr(v, instr(lower(v), '</pre') + instr(substr(v, instr(lower(v), '</pre')), '>')) ELSE substr(v, instr(lower(v), '</pre') + 5) END
  END
  FROM cleaned WHERE instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0
)
UPDATE journal_entries SET content = (
  SELECT v FROM cleaned WHERE cleaned.id = journal_entries.id AND NOT (instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0)
)
WHERE id IN (SELECT id FROM cleaned);

-- journal_entries.context
WITH RECURSIVE cleaned(id, v) AS (
  SELECT id, context FROM journal_entries WHERE context IS NOT NULL AND (instr(lower(context), '<pre') > 0 OR instr(lower(context), '</pre') > 0 OR instr(lower(context), '<code') > 0 OR instr(lower(context), '</code') > 0)
  UNION ALL
  SELECT id, CASE
    WHEN instr(lower(v), '<code') > 0 THEN substr(v, 1, instr(lower(v), '<code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<code')), '>') > 0 THEN substr(v, instr(lower(v), '<code') + instr(substr(v, instr(lower(v), '<code')), '>')) ELSE substr(v, instr(lower(v), '<code') + 5) END
    WHEN instr(lower(v), '</code') > 0 THEN substr(v, 1, instr(lower(v), '</code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</code')), '>') > 0 THEN substr(v, instr(lower(v), '</code') + instr(substr(v, instr(lower(v), '</code')), '>')) ELSE substr(v, instr(lower(v), '</code') + 6) END
    WHEN instr(lower(v), '<pre') > 0 THEN substr(v, 1, instr(lower(v), '<pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<pre')), '>') > 0 THEN substr(v, instr(lower(v), '<pre') + instr(substr(v, instr(lower(v), '<pre')), '>')) ELSE substr(v, instr(lower(v), '<pre') + 4) END
    WHEN instr(lower(v), '</pre') > 0 THEN substr(v, 1, instr(lower(v), '</pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</pre')), '>') > 0 THEN substr(v, instr(lower(v), '</pre') + instr(substr(v, instr(lower(v), '</pre')), '>')) ELSE substr(v, instr(lower(v), '</pre') + 5) END
  END
  FROM cleaned WHERE instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0
)
UPDATE journal_entries SET context = (
  SELECT v FROM cleaned WHERE cleaned.id = journal_entries.id AND NOT (instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0)
)
WHERE id IN (SELECT id FROM cleaned);

-- journal_entries.info
WITH RECURSIVE cleaned(id, v) AS (
  SELECT id, info FROM journal_entries WHERE info IS NOT NULL AND (instr(lower(info), '<pre') > 0 OR instr(lower(info), '</pre') > 0 OR instr(lower(info), '<code') > 0 OR instr(lower(info), '</code') > 0)
  UNION ALL
  SELECT id, CASE
    WHEN instr(lower(v), '<code') > 0 THEN substr(v, 1, instr(lower(v), '<code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<code')), '>') > 0 THEN substr(v, instr(lower(v), '<code') + instr(substr(v, instr(lower(v), '<code')), '>')) ELSE substr(v, instr(lower(v), '<code') + 5) END
    WHEN instr(lower(v), '</code') > 0 THEN substr(v, 1, instr(lower(v), '</code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</code')), '>') > 0 THEN substr(v, instr(lower(v), '</code') + instr(substr(v, instr(lower(v), '</code')), '>')) ELSE substr(v, instr(lower(v), '</code') + 6) END
    WHEN instr(lower(v), '<pre') > 0 THEN substr(v, 1, instr(lower(v), '<pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<pre')), '>') > 0 THEN substr(v, instr(lower(v), '<pre') + instr(substr(v, instr(lower(v), '<pre')), '>')) ELSE substr(v, instr(lower(v), '<pre') + 4) END
    WHEN instr(lower(v), '</pre') > 0 THEN substr(v, 1, instr(lower(v), '</pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</pre')), '>') > 0 THEN substr(v, instr(lower(v), '</pre') + instr(substr(v, instr(lower(v), '</pre')), '>')) ELSE substr(v, instr(lower(v), '</pre') + 5) END
  END
  FROM cleaned WHERE instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0
)
UPDATE journal_entries SET info = (
  SELECT v FROM cleaned WHERE cleaned.id = journal_entries.id AND NOT (instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0)
)
WHERE id IN (SELECT id FROM cleaned);

-- social_posts.content
WITH RECURSIVE cleaned(id, v) AS (
  SELECT id, content FROM social_posts WHERE content IS NOT NULL AND (instr(lower(content), '<pre') > 0 OR instr(lower(content), '</pre') > 0 OR instr(lower(content), '<code') > 0 OR instr(lower(content), '</code') > 0)
  UNION ALL
  SELECT id, CASE
    WHEN instr(lower(v), '<code') > 0 THEN substr(v, 1, instr(lower(v), '<code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<code')), '>') > 0 THEN substr(v, instr(lower(v), '<code') + instr(substr(v, instr(lower(v), '<code')), '>')) ELSE substr(v, instr(lower(v), '<code') + 5) END
    WHEN instr(lower(v), '</code') > 0 THEN substr(v, 1, instr(lower(v), '</code') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</code')), '>') > 0 THEN substr(v, instr(lower(v), '</code') + instr(substr(v, instr(lower(v), '</code')), '>')) ELSE substr(v, instr(lower(v), '</code') + 6) END
    WHEN instr(lower(v), '<pre') > 0 THEN substr(v, 1, instr(lower(v), '<pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '<pre')), '>') > 0 THEN substr(v, instr(lower(v), '<pre') + instr(substr(v, instr(lower(v), '<pre')), '>')) ELSE substr(v, instr(lower(v), '<pre') + 4) END
    WHEN instr(lower(v), '</pre') > 0 THEN substr(v, 1, instr(lower(v), '</pre') - 1) || CASE WHEN instr(substr(v, instr(lower(v), '</pre')), '>') > 0 THEN substr(v, instr(lower(v), '</pre') + instr(substr(v, instr(lower(v), '</pre')), '>')) ELSE substr(v, instr(lower(v), '</pre') + 5) END
  END
  FROM cleaned WHERE instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0
)
UPDATE social_posts SET content = (
  SELECT v FROM cleaned WHERE cleaned.id = social_posts.id AND NOT (instr(lower(v), '<pre') > 0 OR instr(lower(v), '</pre') > 0 OR instr(lower(v), '<code') > 0 OR instr(lower(v), '</code') > 0)
)
WHERE id IN (SELECT id FROM cleaned);
