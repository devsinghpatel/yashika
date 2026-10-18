// /api/save.js - Vercel Serverless Function & Local Dev Handler
import fs from 'node:fs';
import path from 'node:path';

const ADMIN_PASSWORD = "123456";

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
  }

  const { password, content } = body || {};

  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Incorrect master password. Access denied.' });
  }

  if (!content || typeof content !== 'object') {
    return res.status(400).json({ error: 'Missing or invalid content object' });
  }

  // Validate top-level keys
  const requiredKeys = ['theme', 'flow', 'gallery'];
  for (const k of requiredKeys) {
    if (!(k in content)) {
      return res.status(400).json({ error: `Missing required top-level key: ${k}` });
    }
  }

  const jsonString = JSON.stringify(content, null, 2);
  const sizeInBytes = Buffer.byteLength(jsonString, 'utf8');
  if (sizeInBytes > 500 * 1024) {
    return res.status(400).json({ error: 'Payload exceeds 500 KB limit' });
  }

  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO; // e.g. "username/repo"
  const branch = process.env.GITHUB_BRANCH || 'main';

  // If deployed to Vercel and GitHub credentials exist, commit to GitHub
  if (token && repo) {
    try {
      const getFileUrl = `https://api.github.com/repos/${repo}/contents/content.json?ref=${branch}`;
      const getRes = await fetch(getFileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Birthday-CMS-Admin'
        }
      });

      let sha = '';
      if (getRes.ok) {
        const fileData = await getRes.json();
        sha = fileData.sha;
      } else if (getRes.status !== 404) {
        const errText = await getRes.text();
        return res.status(502).json({ error: `GitHub API error fetching file: ${errText}` });
      }

      const putFileUrl = `https://api.github.com/repos/${repo}/contents/content.json`;
      const base64Content = Buffer.from(jsonString, 'utf8').toString('base64');
      const putRes = await fetch(putFileUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Birthday-CMS-Admin',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update content via admin',
          content: base64Content,
          branch,
          sha: sha || undefined
        })
      });

      if (!putRes.ok) {
        const errText = await putRes.text();
        return res.status(502).json({ error: `GitHub commit failed: ${errText}` });
      }

      return res.status(200).json({
        success: true,
        message: 'Content saved and committed to GitHub! Live in about a minute while Vercel redeploys.'
      });
    } catch (err) {
      return res.status(500).json({ error: `Commit exception: ${err.message}` });
    }
  }

  // Local filesystem fallback when running in local dev / without GitHub credentials
  try {
    const filePath = path.resolve(process.cwd(), 'content.json');
    fs.writeFileSync(filePath, jsonString, 'utf8');
    return res.status(200).json({
      success: true,
      message: 'Saved to local content.json! Note: For production Vercel auto-deploy, set GITHUB_TOKEN and GITHUB_REPO.'
    });
  } catch (err) {
    return res.status(500).json({
      error: `Local file write failed: ${err.message}. Also GITHUB_TOKEN or GITHUB_REPO env vars were not found.`
    });
  }
}
