import { Request, Response } from 'express';
import { SiteSetting } from '../models/SiteSetting';

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await SiteSetting.findOne().populate('featuredMembers', 'username role');
    if (!settings) {
      // Create default settings if not exists
      settings = await SiteSetting.create({
        carouselItems: [
          {
            image: 'https://picsum.photos/1920/1080?random=10',
            title: '无限摄制社团',
            subtitle: '记录瞬间，创造永恒',
            description: '我们是一个致力于摄影、摄像和后期制作的创意团体。无论你是新手还是专家，这里都有你施展才华的舞台。'
          },
          {
            image: 'https://picsum.photos/1920/1080?random=20',
            title: '光影的艺术',
            subtitle: '捕捉世界的光与影',
            description: '每一次快门都是一次对美好的定格，每一帧画面都是对生活的致敬。'
          },
          {
            image: 'https://picsum.photos/1920/1080?random=30',
            title: '创意的汇聚',
            subtitle: '灵感碰撞，火花四溅',
            description: '在这里，你可以找到志同道合的伙伴，一起完成那些疯狂而美妙的创意。'
          }
        ],
        featuredVideos: [],
        featuredMembers: [],
        contactEmail: 'contact@wxsz.com',
        contactAddress: '社团活动中心 305 室',
        aboutContent: '欢迎来到无限摄制社团！在这里，我们用镜头记录美好，用创意点亮生活。'
      });
    }
    res.json(settings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { carouselItems, featuredVideos, featuredMembers, contactEmail, contactAddress, aboutContent } = req.body;
    let settings = await SiteSetting.findOne();
    
    if (settings) {
      if (carouselItems) settings.carouselItems = carouselItems;
      if (featuredVideos) settings.featuredVideos = featuredVideos;
      if (featuredMembers) settings.featuredMembers = featuredMembers;
      if (contactEmail !== undefined) settings.contactEmail = contactEmail;
      if (contactAddress !== undefined) settings.contactAddress = contactAddress;
      if (aboutContent !== undefined) settings.aboutContent = aboutContent;
      await settings.save();
    } else {
      settings = await SiteSetting.create({ 
        carouselItems, 
        featuredVideos, 
        featuredMembers,
        contactEmail,
        contactAddress,
        aboutContent
      });
    }
    
    // Re-fetch to populate
    const updatedSettings = await SiteSetting.findById(settings._id).populate('featuredMembers', 'username role');
    res.json(updatedSettings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器内部错误' });
  }
};
