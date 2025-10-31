import React from 'react';
import { styled } from '@mui/material/styles';
import Card from './Card';
import { Box, Typography } from '@mui/material';
import zgzgLogo from '.././images/zgzg/zgzglogo.webp';

const BaseCard = styled(Card)({
    margin: '8px 0'
});

const GreenCard = styled(Card)({
    background: '#e8f5e9', // light green
    margin: '8px 0'
});

const BlueCard = styled(Card)({
    background: '#e3f2fd', // light blue
    margin: '8px 0'
});

const YellowCard = styled(Card)({
    background: '#fff8e1', // light yellow
    margin: '8px 0'
});

const PurpleCard = styled(Card)({
    background: '#f3e5f5', // light purple
    margin: '8px 0'
});

const RedCard = styled(Card)({
    background: '#ffebee', // light red
    margin: '8px 0'
});

const GrayCard = styled(Card)(({ theme }) => ({
    background: '#f5f5f5', // light gray
    margin: '8px 0',
    padding: theme.spacing(2) // Adding some padding for better readability
}));

const Guide: React.FC = () => {
    return (
        <Box>
            <BaseCard>
                <div style={{ textAlign: 'center', justifyContent: 'center' }}>
                    <Typography variant='h5' style={{ textAlign: 'center', fontWeight: 'bold' }}>载歌在谷2025秋季游园会</Typography>
                    <Typography variant='h5' style={{ textAlign: 'center', fontWeight: 'bold' }}>电子地图 Mobile Map</Typography>
                    <img src={zgzgLogo} alt='ZGZG Logo' style={{ width: '50px', paddingTop: '5px', paddingBottom: '5px' }}></img>
                </div>
                <Typography>🗓️ 日期 Date: 2025-11-02 (周日Sunday) </Typography>
                <Typography>🕓 时间 Time: 12:00 PM - 5:00 PM (冬令时Daylight Saving Time)</Typography>
            </BaseCard>

            <GreenCard>
                <Box>
                    <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1, color: '#2e7d32' }}>
                        🎟 入场须知 Admission Notice
                    </Typography>

                    <Typography sx={{ fontWeight: 'bold' }}>1️⃣ 提前准备二维码，凭票入场</Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • 入场视为您已阅读并同意本活动的 <a href="https://zgzg.io/audience-waiver">ZGZG Event Waiver & Disclaimer</a> （包括安全提示与肖像权授权）。
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 1 }}>
                        • 📲 每位游客（或家庭代表）请提前在【Eventbrite / Taro报名页面】中获取入场二维码。
                    </Typography>

                    <Typography sx={{ fontWeight: 'bold' }}>2️⃣ 现场扫码核验。验证成功后，将为您发放：</Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • 📿 <b>手环</b> （凭此可自由出入园区）
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • 🧭 <b>家庭通关卡</b> （完成NPC任务与兑换纪念品的凭证）
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 1 }}>
                        • 🅿️ <b>停车券</b> （限登记车辆使用，游客lot 2和4）
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, fontStyle: 'italic', color: 'text.secondary' }}>
                        ⚠️ 备注：<b>普通入场券不包括付费摊位所用的游戏币</b>。现场 check in 处可以购买游戏币。
                    </Typography>

                    <Typography sx={{ fontWeight: 'bold', mt: 1 }}>3️⃣ 入场完成后</Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • 请佩戴好手环并妥善保管家庭通关卡。
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • 凭家庭通关卡可在各NPC点完成互动任务、集章、兑换礼品。
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, color: '#d32f2f', fontWeight: 'bold' }}>
                        • 🚫 遗失手环或通关卡将无法重新领取，请务必保管好！
                    </Typography>
                </Box>
            </GreenCard>

            <YellowCard>
                <Box>
                    <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1, color: '#f57f17' }}>
                        🚗 停车 Parking
                    </Typography>

                    <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>🅿️ 停车区域 Parking Zones:</Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • 游客停车区域 (Attendee Parking): <b>2️⃣ 号 & 4️⃣ 号停车场</b>
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 1 }}>
                        • 志愿者与演员停车区域 (Volunteer/Performer Parking): <b>3️⃣ 号停车场</b>
                    </Typography>
                    <Typography variant='body2' sx={{ fontStyle: 'italic', mb: 1 }}>
                        📍 请遵循现场指示牌与工作人员引导，有序停放车辆。
                    </Typography>

                    <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>🎫 停车须知 Parking Rules:</Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • <b>1️⃣ 请提前购票或领取停车票。</b>
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • <b>2️⃣</b> 在检票处出示停车票后，可领取<b>“观众停车许可”</b>。
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, color: '#d32f2f', fontWeight: 'bold' }}>
                        • <b>3️⃣ 请勿随意占道或临时停车，确保通行顺畅与安全🚦。</b>
                    </Typography>
                </Box>
            </YellowCard>

            <BlueCard>
                <Box>
                    <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1, color: '#1565c0' }}>
                        🪙 游戏币说明 Game Coin Instructions
                    </Typography>

                    <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>🎟️ 票种说明 Ticket Type</Typography>
                    <Typography variant='body2' sx={{ ml: 2 }}>
                        • <b>普通票</b> (General Admission) <b>不含游戏币</b>
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 1 }}>
                        • 👑 <b>VIP套票</b> (VIP Package) 包含 <b>12个付费摊位各一次体验</b>
                    </Typography>

                    <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>💰 游戏币购买方式 Purchase</Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 1 }}>
                        • 现场购买： <b>$3/枚</b> （部分摊位及小游戏需使用一个或两个游戏币，不同颜色面值相同）
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 1 }}>
                        • 购买地点：🪪 <b>签到处</b>（入口处）
                    </Typography>

                    <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>🎁 完成任务免费赢取 Free Coins (每人仅限1次 Each limited to 1 time)</Typography>
                    <Typography variant='body2' sx={{ ml: 2 }}>
                        • ✅ <b>打卡赞助商摊位</b>：打卡5个赞助商加赠1个游戏币（🪪 签到处 领取）
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2 }}>
                        • 🔁 <b>转发社交媒体活动</b>：拍照转发社交媒体赠1个游戏币（🪪 签到处 领取）
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 1 }}>
                        • 📚 <b>捐书参与公益</b>：捐书即送1个游戏币（捐书时云集摊位领取）
                    </Typography>

                    <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>🔄 游戏币兑换 Coin Redemption</Typography>
                    <Typography variant='body2' sx={{ ml: 2 }}>
                        • 剩余游戏币可兑换<b>中文剧本杀</b>或<b>帆布袋</b>。先到先得，送完为止。
                    </Typography>
                </Box>
            </BlueCard>

            <PurpleCard>
                <Box>
                    <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1, color: '#673ab7' }}>
                        🏃‍♂️<b>家庭通关卡 Family Pass Card</b>
                    </Typography>

                    <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>💮 打卡类别 Stamp Categories</Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • 通关卡分三个打卡类别：<b>传统</b>、<b>非传统</b>、<b>赞助</b>。每个摊位有自己固定的打卡类别。
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • 赞助摊位打卡满5个，可以前往🪪 <b>签到处</b>领取额外<b>1个游戏币</b>。
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 1.5 }}>
                        • 打卡满足一定条件，可以前往🎁 <b>兑奖处</b>领取奖品。
                    </Typography>

                    <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>🏆 打卡兑奖 Prize Redemption</Typography>
                    <Box sx={{ ml: 2 }}>
                        <Typography variant='body2' sx={{ mb: 0.5 }}>
                            • <b>30 🕹️ = 特等奖22个</b>：怀旧电子游戏机 (Special Prize: Retro Video Game Console)
                        </Typography>
                        <Typography variant='body2' sx={{ mb: 0.5 }}>
                            •<b> 26 🕹️ = 一等奖60个</b>：50盒中文剧本杀游戏，10个小猫风扇 (First Prize: 50 Chinese Murder Mystery Game Sets & 10 Cat-Shaped Fans)
                        </Typography>
                        <Typography variant='body2' sx={{ mb: 0.5 }}>
                            • <b>20 🕹️ = 二等奖100个</b>：40个搞笑抽纸玩偶，60个穿越时空帆布袋 (Second Prize: 40 Funny Tissue Box Dolls & 60 Canvas Bags)
                        </Typography>
                        <Typography variant='body2' sx={{ mb: 0.5 }}>
                            • <b>16 🕹️ = 三等奖160个</b>：80个卡皮巴拉变脸玩具，80个小笔记本 (Third Prize: 80 Kapibara Face-Changing Toys & 80 Mini Notebooks)
                        </Typography>
                        <Typography variant='body2'>
                            • <b>8 🕹️ = 群众奖400个</b>：仿真鱼圆珠笔，青蛙吐舌头吹吹乐，盲袋，旋转陀螺，贴纸 (Participation Prize: Realistic Fish Ballpoint Pens, Frog Tongue Blowers, Blind Bags, Spinning Tops & Stickers)
                        </Typography>
                    </Box>
                </Box>
            </PurpleCard>

            <RedCard>
                <Box>
                    <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1, color: '#d32f2f' }}>
                        ⚠️ <b>安全提示 Safety Tips</b>
                    </Typography>

                    <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>1️⃣ 儿童安全 Children's Safety</Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • ⚠️ 场地内车辆通行请注意安全，请让孩子在<b>成人陪同下</b>在活动区域游玩。
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 1 }}>
                        • 丢失走散请立即前往 <b>问询处</b> (CheckIn) 寻求帮助。
                    </Typography>

                    <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>2️⃣ 防晒与饮水 Sun Protection & Hydration</Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • 户外活动请注意<b>防晒</b>。
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 1 }}>
                        • ⚠️ 请注意<b>及时补充水分</b>（园内有饮水台）。
                    </Typography>

                    <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>3️⃣ 场地环境 Environment</Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • 场地内有阶梯，请注意<b>脚下安全</b>。
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • 请勿在场地内<b>奔跑、攀爬</b>，防止意外发生。
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • 请勿靠近水域，严禁嬉水。
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 1 }}>
                        • <b>严禁吸烟</b>，请共同维护环境。
                    </Typography>

                    <Typography sx={{ fontWeight: 'bold', mt: 1, mb: 0.5 }}>4️⃣ 宠物 Pets</Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • 🐾 场地内有宠物表演者、试驾车辆、流动节目，请<b>保持警觉</b>。
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2 }}>
                        • 🚫 非宠物主人<b>请勿随意触摸动物</b>，以免惊吓或发生意外。
                    </Typography>

                    <Typography sx={{ fontWeight: 'bold', mb: 0.5 }}>5️⃣ 紧急情况 Emergency</Typography>
                    <Typography variant='body2' sx={{ ml: 2, mb: 0.5 }}>
                        • 若有紧急情况或身体不适，请及时联系 <b>问询处</b>(CheckIn) 或工作人员寻求帮助。
                    </Typography>
                    <Typography variant='body2' sx={{ ml: 2 }}>
                        • 🏥 现场设有<b>应急医药箱</b>。
                    </Typography>
                </Box>
            </RedCard>

            <GrayCard>
                <Box>
                    <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1, color: '#616161' }}>
                        <b>免责声明 Disclaimer</b>
                    </Typography>

                    <Typography variant='caption' component='div' sx={{ mb: 1.5 }}>
                        1. 本活动为非营利性质的游园室外活动。凡是活动参与者，均为自愿参加本次活动，了解此次活动存在的危险性，并必须接受此免责条款。
                    </Typography>
                    <Typography variant='caption' component='div' sx={{ mb: 1.5 }}>
                        2. 为了给各位游客提供更好的体验，本次活动派发独立包装的小零食，并有食物摊位售卖食物。此次活动内任何食物是通过正规途径所得并且已取得政府部门的检测许可。请仔细查看食物配料表，谨防误食个人过敏食材。参加活动即视为接受本条款。若食用后出现任何不适的现象，载歌载谷团队并不为此付任何责任。
                    </Typography>
                    <Typography variant='caption' component='div' sx={{ mb: 1.5 }}>
                        3. 载歌在谷游园会主办方拥有本此活动的图像采集权，参加本活动即代表授权载歌在谷采集、使用活动当天的图像用于记录和宣传。
                    </Typography>
                    <Typography variant='caption' component='div' sx={{ mb: 1.5 }}>
                        4. 载歌在谷游园会主办方及其委托的安保人员，对现场人群有监管控制权，参加本活动即代表同意接受主办方及安保人员的安排和管理，协同维护现场公共秩序，确保活动的有序进行。有严重扰乱活动秩序者，违反活动规则，扰乱公共秩序的游客，主办方有权取消其游园资格，并采取相应法律手段确保公共安全。
                    </Typography>
                    <Typography variant='caption' component='div' sx={{ mb: 1.5 }}>
                        5. 请注意，载歌在谷(ZGZG)秋季游园的狗狗秀活动中将有活体动物参与。为确保所有来宾、参与者及动物的安全与舒适，请勿在未得到饲主允许的情况下触摸、喂食或接近任何狗只，并确保儿童在狗狗秀区域内由成人陪同。所有狗只均由其主人直接照管，请避免拥挤或惊吓动物。进入或停留在狗狗秀区域，即表示您已知悉并接受，载歌在谷(ZGZG)及其附属机构和志愿者对因与动物互动而造成的任何伤害、疾病或意外事件不承担责任，您须自行承担相关风险。
                    </Typography>
                    <Typography variant='caption' component='div' sx={{ mb: 3 }}>
                        6. 载歌在谷游园会主办方拥有对任何活动/规则有最终解释权。
                    </Typography>

                    <Typography variant='caption' component='div' sx={{ mb: 1.5 }}>
                        1. This event is a non-profit outdoor event. All participants in this event are voluntary and acknowledge the potential risks involved. Participants must agree to these waiver terms.
                    </Typography>
                    <Typography variant='caption' component='div' sx={{ mb: 1.5 }}>
                        2. To provide a better experience, the event provides individually packaged snacks and has food stalls selling food. All food at this event has obtained government inspection permits. Please carefully check the food ingredient list to avoid accidentally eating food that you are allergic to.By participating in the event, you are deemed to have accepted these terms. Participants are responsible for any problems that may arise. The ZGZG team will not be held responsible for any discomfort caused by food consumption.
                    </Typography>
                    <Typography variant='caption' component='div' sx={{ mb: 1.5 }}>
                        3. The ZGZG team owns the image collection rights for this event. By participating in this event, you authorize ZGZG to collect and use images taken on the day of the event for recording and publicity purposes.
                    </Typography>
                    <Typography variant='caption' component='div' sx={{ mb: 1.5 }}>
                        4. The ZGZG team and its entrusted security personnel have the right to supervise and control the crowd on site. By participating in this event, you agree to accept the arrangements and management of the organizer and security personnel and cooperate in maintaining public order at the venue to ensure the smooth running of the event.
                    </Typography>
                    <Typography variant='caption' component='div' sx={{ mb: 1.5 }}>
                        5. Please note that live animals will be present at the Zaigezaigu (ZGZG) Fall Culture Fair Dog Show. For everyone’s safety and comfort, please do not touch, feed, or approach any dogs unless invited by their handler, and ensure that children are accompanied by an adult in the dog show area. All dogs are under the direct care and supervision of their owners, and attendees are asked to avoid crowding or startling them. By entering or remaining in the dog show area, you acknowledge and accept that Zaigezaigu, its affiliates, and volunteers are not responsible for any injury, illness, or incident resulting from interactions with animals, and that you do so at your own risk.
                    </Typography>
                    <Typography variant='caption' component='div'>
                        6. The ZGZG community has the final right to interpret any event or rules.
                    </Typography>
                </Box>
            </GrayCard>
        </Box>
    );
};

export default Guide;