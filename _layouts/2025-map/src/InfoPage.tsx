import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Tabs, Tab, Box, Typography, FormControl, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { Story } from './data';
import allLogoImage from './images/logos/all_logos.svg';
import VolunteerCard from './components/VolunteerCard';
import Guide from './components/Guide';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const CustomDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        width: '90vw',
        height: '90vh',
        maxWidth: 'none',
        margin: '20px',
    },
}));

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`info-tabpanel-${index}`}
            aria-labelledby={`info-tab-${index}`}
            {...other}
            style={{ height: '100%', overflow: 'auto' }}
        >
            {value === index && (
                <Box sx={{ p: 3, height: '100%' }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

interface InfoPageProps {
    open: boolean;
    onClose: () => void;
    stories: Story[];
    selectedStoryId: string;
    onStoryChange: (event: SelectChangeEvent) => void;
}

export const InfoPage: React.FC<InfoPageProps> = ({
    open,
    onClose,
    stories,
    selectedStoryId,
    onStoryChange
}) => {
    const [tabValue, setTabValue] = React.useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    return (
        <CustomDialog
            open={open}
            onClose={onClose}
            maxWidth={false}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* <Typography variant="h6">信息 Information</Typography> */}
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%', borderTop: 'none' }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="info tabs"
                    sx={{
                        borderBottom: 1, borderColor: 'divider', '& .MuiTabs-scroller': {
                            borderTop: 'none', // Remove the top border
                        },
                    }}
                >
                    <Tab label="游园指南 Guide" />
                    {/* <Tab label="赞助 Sponsors" /> */}
                    <Tab label="鸣谢 Acknowledgement" />
                </Tabs>
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <CustomTabPanel value={tabValue} index={0}>
                        {/* <Box sx={{ mb: 2 }}>
                            <FormControl fullWidth>
                                <Select
                                    value={selectedStoryId}
                                    onChange={onStoryChange}
                                    displayEmpty
                                >
                                    <MenuItem value="">
                                        <em>选择一个故事线 Select a story</em>
                                    </MenuItem>
                                    {stories.map((story) => (
                                        <MenuItem key={story.id} value={story.id}>
                                            {story.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box> */}
                        <Guide />
                    </CustomTabPanel>
                    <CustomTabPanel value={tabValue} index={1}>
                        <Typography variant="h6" sx={{
                            whiteSpace: 'pre-wrap', // Respects newlines and wraps long lines
                        }}>赞助/伙伴社区 Sponsorship/Partner Communities</Typography>
                        <img src={allLogoImage} alt="All Sponsors Logos" style={{ height: 'auto', objectFit: 'contain' }} />
                        <Typography variant="h6">志愿者列表 Volunteers</Typography>
                        <VolunteerCard>
                            <div>
                                <p><b>出品人:</b> 周载南, Zoey</p>
                                <p><b>联合出品人:</b> Jesse, Yayi, Xuan, Marcus, Sunny, Monica Qian, Cherie, Yang Lin, Lisa Z, 天虹, 旮旯</p>
                                <p><b>预算委主席:</b> Feixia Xu</p>
                                <p><b>顾问:</b> 张越, 蒋峥, Yudy, Senkei, 艺驰, 宋博, 拓, Aiden</p>
                                <p><b>舞台总导演:</b> Yayi</p>
                                <p><b>首席运营官:</b> Jesse</p>
                                <p><b>首席发言人:</b> Sunny</p>
                                <p><b>首席设计师:</b> Moncia Qian</p>
                                <p><b>宣发组:</b> Cherie, Sunny, Monica Qian, Stella, Marcus, Daniel, Lia, 舒欣, Zhirui, 尚轩, 欧阳, Lisa Z</p>
                                <p><b>产品组:</b> 陈天虹，旮旯，Xuan, 嘉琪，Maria Shan, Annie Men, 爱问Evan, Christopher Yin, Zhiwei, Jiancheng Zheng / Mina, Steven Zhang, 于皓, Elizabeth Chien, Xi Wang, Jay, 恩祺, Xiaohan Li（able2shine)+ Mom Tracy, Maya Lian, Sindu Tunuguntla (able2shine) + mom, Brenda Sheng, Esther Tucholski, Sunnie Gao, Charlotte Zhou, Ruoxi Liu, Lichuan, Catherine Zhang, Kaishan Lim, Wenzhi Liu, Jiaqi Wang, Rongxuan Zhu, Kairan Zhong, Fang Li BuBa, Jasmine Qian, Huimin Su, Xiaofeng Qian, Xu Jing, Coco Wei, Cathy Liu, Zhibo Wei, Kelsey Sun (Ying), Johnson / Kai Shan, Lucy Ding, Sarah Gong, Grace Cao, Alicia, Yuhong Jiang, Angela, Elaine Zhou (Ying), 苗, Anson Sun, Ryan 张, Kristina Chen, Lisa, Emily Gong, 赵亚楠ni, 赵明, Terry, Ruijing YA NG, Yunjie Ma, Lu, Jianjia (Daniel) Zhang, Zimeng Dou, Jinnje Wang, 林楷善, Jing Shu, Frank Huang, Leon, Terry Li, Fran Mok, Christine Zheng, Sunny, 格格, Xuxing Liu, Cindy Yang, Molly Li, Angela Wang, Christine Huang, Emily Yang, Ashley Yue, Joe Xu, Audrey Mi, Allison Mi, Chloe Wang, Vivian Yao, Jackie Yao, Dandan Liu, 三宝妈妈, Nora Ma, Ariana Menhenne, Tina Meng, Catherine Zhang, Yiliu, Tina Chen, 书画李老师, Sarah Hong, Shaodong Xu, Zhuoyang L, June, Jason He, Jerry He, Cynthia Chen, Hua Yang, 高娃, 徐瑾, Vivian Feng, Ethan Sema, Sophie Shan, Siting Yu, Hypatia Johnson, Peter Ning</p>
                                <p><b>运营组:</b> Jesse, Feixia Xu, 林阳, Leiyi, Joyce, Kristen Wang, Ly, Amy Wu, 吴晓, Hannah, 小熊Patricia, 乐天的海豚, 于皓, 大路，Yk, Chuyue, 十万为什么无极小经办, 珊阳, 耳又又, Elystin, Linan, 云彩, Jenny, Zoe, Grace</p>
                                <p><b>舞台演员:</b> Flagdog 乐队, Leap 离璞乐队, Leland High School, Anastasia Miin, 雅韵国乐社, 自律不平庸组合, LÉAP声跃音合唱团, Stephanie Xu, Lola Xu, Sarah Xue, 耿老师, Shaolin Warrior Martial Arts, TwinX Zoe & Jade, ShéNova feat. Acey Dance, 徐沁梅, 杨倩茹 from Stanford VFG Dance, Elena He, 硅谷汉服社, 拾乐团 Find A Cappella, 加州汽水乐队, Dynamic Kung Fu Academy, Aevum Mistry, Aiona Mistry, BabyAstra from 85Fun Studio, 特邀嘉宾：离谱乐队主唱 Tianyi</p>
                                <p><b>舞台主持人:</b> 段孟汐, 晓晓, 张博文, 竹子</p>
                                <p><b>摄影:</b> 晓白 MBreeze, Aidan Fang, Yani Qin, Daniel, 硅谷刘律, Daisy, Lia</p>
                                <p><b>云集:</b> 若飞, Dave, 菠菜菜</p>
                                <p><b>技术组:</b> Orca（电子地图）, Zephyr（在线证书）</p>
                                <p><b>舞台组</b></p>
                                <ul>
                                    <li><b>副导演:</b> Tony Jia</li>
                                    <li><b>主持人导演:</b> 竹子</li>
                                    <li><b>评审委:</b> Cloris, 老莫, Aiden Fang, Zoey Zhang</li>
                                    <li><b>舞台顾问:</b> 曹翔</li>
                                    <li><b>导演组助理:</b> Qiyue</li>
                                    <li><b>音响总监:</b> 单拓, 曹翔</li>
                                    <li><b>节目策划:</b> Stella, Qiyue, Yating</li>
                                    <li><b>狗狗秀策划:</b> Yayi, Tony Jia, 孟汐</li>
                                    <li><b>舞台外联:</b> Zoe, 竹子, Qiyue</li>
                                    <li><b>舞美设计:</b> Monica Qian, Stella</li>
                                    <li><b>舞台摄制:</b> Yani, Stella, 晓白, Aiden Fang</li>
                                    <li><b>演员统筹:</b> Zoe, Tony Jia, Qiyue, Stella, Yating, Max, Jiaqi, 竹子</li>
                                </ul>
                            </div>
                        </VolunteerCard>
                    </CustomTabPanel>
                </Box>
            </DialogContent>
        </CustomDialog >
    );
};