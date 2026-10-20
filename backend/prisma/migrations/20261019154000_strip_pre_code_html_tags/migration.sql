-- SQLite n'a pas de regexp_replace fiable : on retire les wrappers
-- les plus courants produits par TipTap / collages markdown.
-- Le script backend/scripts/clean-code-tags.ts couvre aussi les variantes avec attributs.

UPDATE dialogue_lines SET text = REPLACE(REPLACE(REPLACE(REPLACE(text, '<code class="language-json">', ''), '</code>', ''), '<pre>', ''), '</pre>', '')
WHERE instr(lower(text), '<pre') > 0 OR instr(lower(text), '<code') > 0;

UPDATE dialogue_choices SET text = REPLACE(REPLACE(REPLACE(REPLACE(text, '<code class="language-json">', ''), '</code>', ''), '<pre>', ''), '</pre>', '')
WHERE instr(lower(text), '<pre') > 0 OR instr(lower(text), '<code') > 0;

UPDATE dialogues SET description = REPLACE(REPLACE(REPLACE(REPLACE(description, '<code class="language-json">', ''), '</code>', ''), '<pre>', ''), '</pre>', '')
WHERE description IS NOT NULL AND (instr(lower(description), '<pre') > 0 OR instr(lower(description), '<code') > 0);

UPDATE sms_messages SET text = REPLACE(REPLACE(REPLACE(REPLACE(text, '<code class="language-json">', ''), '</code>', ''), '<pre>', ''), '</pre>', '')
WHERE instr(lower(text), '<pre') > 0 OR instr(lower(text), '<code') > 0;

UPDATE sms_messages SET shortContent = REPLACE(REPLACE(REPLACE(REPLACE(shortContent, '<code class="language-json">', ''), '</code>', ''), '<pre>', ''), '</pre>', '')
WHERE shortContent IS NOT NULL AND (instr(lower(shortContent), '<pre') > 0 OR instr(lower(shortContent), '<code') > 0);

UPDATE sms_questions SET content = REPLACE(REPLACE(REPLACE(REPLACE(content, '<code class="language-json">', ''), '</code>', ''), '<pre>', ''), '</pre>', '')
WHERE instr(lower(content), '<pre') > 0 OR instr(lower(content), '<code') > 0;

UPDATE sms_answers SET content = REPLACE(REPLACE(REPLACE(REPLACE(content, '<code class="language-json">', ''), '</code>', ''), '<pre>', ''), '</pre>', '')
WHERE instr(lower(content), '<pre') > 0 OR instr(lower(content), '<code') > 0;

UPDATE sms_answers SET shortContent = REPLACE(REPLACE(REPLACE(REPLACE(shortContent, '<code class="language-json">', ''), '</code>', ''), '<pre>', ''), '</pre>', '')
WHERE shortContent IS NOT NULL AND (instr(lower(shortContent), '<pre') > 0 OR instr(lower(shortContent), '<code') > 0);

UPDATE sms_answers SET cpuResponse = REPLACE(REPLACE(REPLACE(REPLACE(cpuResponse, '<code class="language-json">', ''), '</code>', ''), '<pre>', ''), '</pre>', '')
WHERE cpuResponse IS NOT NULL AND (instr(lower(cpuResponse), '<pre') > 0 OR instr(lower(cpuResponse), '<code') > 0);

UPDATE journal_entries SET content = REPLACE(REPLACE(REPLACE(REPLACE(content, '<code class="language-json">', ''), '</code>', ''), '<pre>', ''), '</pre>', '')
WHERE instr(lower(content), '<pre') > 0 OR instr(lower(content), '<code') > 0;

UPDATE journal_entries SET context = REPLACE(REPLACE(REPLACE(REPLACE(context, '<code class="language-json">', ''), '</code>', ''), '<pre>', ''), '</pre>', '')
WHERE instr(lower(context), '<pre') > 0 OR instr(lower(context), '<code') > 0;

UPDATE journal_entries SET info = REPLACE(REPLACE(REPLACE(REPLACE(info, '<code class="language-json">', ''), '</code>', ''), '<pre>', ''), '</pre>', '')
WHERE instr(lower(info), '<pre') > 0 OR instr(lower(info), '<code') > 0;

UPDATE social_posts SET content = REPLACE(REPLACE(REPLACE(REPLACE(content, '<code class="language-json">', ''), '</code>', ''), '<pre>', ''), '</pre>', '')
WHERE instr(lower(content), '<pre') > 0 OR instr(lower(content), '<code') > 0;
