import { Request, Response } from "express";
import Arc from "../models/arcModel";

export const createArc = async (req: Request, res: Response) => {
  try {
    const { userId, title, theme, coverPhoto } = req.body;

    if (!userId || !title || !theme || !coverPhoto) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const arc = await Arc.create({
      userId,
      title,
      theme,
      coverPhoto,
      archived: false,
      updates: [],
      followers: [],
      lastUpdatedAt: new Date()
    });

    res.status(201).json({ message: "Arc created", data: arc });
  } catch (error) {
    console.error("Error creating arc:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadArcCoverPhoto = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(200).json({ 
      message: "Cover photo uploaded", 
      coverPhoto: req.file.path 
    });
  } catch (error) {
    console.error("Error uploading cover photo:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserArcs = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const arcs = await Arc.find({ userId }).sort({ lastUpdatedAt: -1 });

    res.status(200).json({ data: arcs });
  } catch (error) {
    console.error("Error fetching user arcs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getArcById = async (req: Request, res: Response) => {
  try {
    const { arcId } = req.params;

    const arc = await Arc.findById(arcId);

    if (!arc) {
      return res.status(404).json({ message: "Arc not found" });
    }

    res.status(200).json({ data: arc });
  } catch (error) {
    console.error("Error fetching arc:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addArcUpdate = async (req: Request, res: Response) => {
  try {
    const { arcId } = req.params;
    const { type, text, images } = req.body;

    if (!type || !text) {
      return res.status(400).json({ message: "Type and text are required" });
    }

    if (images && images.length > 2) {
      return res.status(400).json({ message: "Max 2 images allowed" });
    }

    const arc = await Arc.findById(arcId);

    if (!arc) {
      return res.status(404).json({ message: "Arc not found" });
    }

    if (arc.archived) {
      return res.status(400).json({ message: "Cannot add updates to archived arc" });
    }

    arc.updates.push({
      type,
      text,
      images: images || [],
      createdAt: new Date()
    } as any);

    arc.lastUpdatedAt = new Date();

    await arc.save();

    res.status(200).json({ message: "Update added", data: arc });
  } catch (error) {
    console.error("Error adding update:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadArcUpdateImages = async (req: Request, res: Response) => {
  try {
    const { arcId, type, text } = req.body;

    if (!arcId || !type || !text) {
      return res.status(400).json({ message: "arcId, type, and text are required" });
    }

    const arc = await Arc.findById(arcId);

    if (!arc) {
      return res.status(404).json({ message: "Arc not found" });
    }

    if (arc.archived) {
      return res.status(400).json({ message: "Cannot add updates to archived arc" });
    }

    const files = req.files as Express.Multer.File[];

    if (files && files.length > 2) {
      return res.status(400).json({ message: "Max 2 images allowed" });
    }

    const imagePaths = files ? files.map(f => f.path) : [];

    arc.updates.push({
      type,
      text,
      images: imagePaths,
      createdAt: new Date()
    } as any);

    arc.lastUpdatedAt = new Date();

    await arc.save();

    res.status(200).json({ 
      message: "Update with images added", 
      data: arc 
    });
  } catch (error) {
    console.error("Error uploading arc update images:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateArc = async (req: Request, res: Response) => {
  try {
    const { arcId } = req.params;
    const { title, theme, coverPhoto } = req.body;

    const arc = await Arc.findById(arcId);

    if (!arc) {
      return res.status(404).json({ message: "Arc not found" });
    }

    if (title) arc.title = title;
    if (theme) arc.theme = theme;
    if (coverPhoto) arc.coverPhoto = coverPhoto;

    await arc.save();

    res.status(200).json({ message: "Arc updated", data: arc });
  } catch (error) {
    console.error("Error updating arc:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const archiveArc = async (req: Request, res: Response) => {
  try {
    const { arcId } = req.params;

    const arc = await Arc.findById(arcId);

    if (!arc) {
      return res.status(404).json({ message: "Arc not found" });
    }

    arc.archived = true;
    await arc.save();

    res.status(200).json({ message: "Arc archived", data: arc });
  } catch (error) {
    console.error("Error archiving arc:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const unarchiveArc = async (req: Request, res: Response) => {
  try {
    const { arcId } = req.params;

    const arc = await Arc.findById(arcId);

    if (!arc) {
      return res.status(404).json({ message: "Arc not found" });
    }

    arc.archived = false;
    await arc.save();

    res.status(200).json({ message: "Arc unarchived", data: arc });
  } catch (error) {
    console.error("Error unarchiving arc:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const followArc = async (req: Request, res: Response) => {
  try {
    const { arcId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const arc = await Arc.findById(arcId);

    if (!arc) {
      return res.status(404).json({ message: "Arc not found" });
    }

    const alreadyFollowing = arc.followers.some(
      (f: any) => f.userId === userId
    );

    if (alreadyFollowing) {
      return res.status(400).json({ message: "Already following this arc" });
    }

    arc.followers.push({
      userId,
      createdAt: new Date()
    } as any);

    await arc.save();

    res.status(200).json({ message: "Arc followed", data: arc });
  } catch (error) {
    console.error("Error following arc:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const unfollowArc = async (req: Request, res: Response) => {
  try {
    const { arcId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const arc = await Arc.findById(arcId);

    if (!arc) {
      return res.status(404).json({ message: "Arc not found" });
    }

    arc.followers = arc.followers.filter(
      (f: any) => f.userId !== userId
    ) as any;

    await arc.save();

    res.status(200).json({ message: "Arc unfollowed", data: arc });
  } catch (error) {
    console.error("Error unfollowing arc:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFollowedArcs = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const arcs = await Arc.find({
      "followers.userId": userId
    }).sort({ lastUpdatedAt: -1 });

    res.status(200).json({ data: arcs });
  } catch (error) {
    console.error("Error fetching followed arcs:", error);
    res.status(500).json({ message: "Server error" });
  }
};