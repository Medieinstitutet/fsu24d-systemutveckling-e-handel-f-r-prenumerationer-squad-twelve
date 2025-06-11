import { Request, Response } from 'express';
import { db } from '../utils/db';

// GET all content
export const getAllContent = async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM content ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('GET ALL CONTENT ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch content' });
  }
};

// CREATE new content
export const createContent = async (req: Request, res: Response) => {
  const { title, body, access_level } = req.body;

  if (!title || !body || !access_level) {
    res
      .status(400)
      .json({ message: 'Title, body and access level are required' });
    return;
  }

  try {
    await db.query(
      'INSERT INTO content (title, body, access_level) VALUES (?, ?, ?)',
      [title, body, access_level]
    );
    res.status(201).json({ message: 'Content created successfully ✅' });
  } catch (error) {
    console.error('CREATE CONTENT ERROR:', error);
    res.status(500).json({ message: 'Failed to create content' });
  }
};

// UPDATE content
export const updateContent = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, body, access_level } = req.body;

  try {
    await db.query(
      'UPDATE content SET title = ?, body = ?, access_level = ? WHERE id = ?',
      [title, body, access_level, id]
    );
    res.json({ message: 'Content updated successfully ✅' });
  } catch (error) {
    console.error('UPDATE CONTENT ERROR:', error);
    res.status(500).json({ message: 'Failed to update content' });
  }
};

// DELETE content
export const deleteContent = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM content WHERE id = ?', [id]);
    res.json({ message: 'Content deleted successfully ❌' });
  } catch (error) {
    console.error('DELETE CONTENT ERROR:', error);
    res.status(500).json({ message: 'Failed to delete content' });
  }
};
