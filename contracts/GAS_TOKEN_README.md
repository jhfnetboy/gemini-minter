# GasToken 工厂合约

用于SuperPaymaster V3的Gas代币系统,支持多种PNT代币和内置预授权。

## 核心功能

### 1. 内置预授权
- ✅ 用户收到代币时自动授权Settlement合约
- ✅ 授权额度为MAX_UINT256 (无限额度)
- ✅ **用户无法撤销Settlement授权** (防止逃避付费)
- ✅ 转账时自动维护授权

### 2. 多代币支持
- 通过Factory部署不同的PNT变种 (PNT, aPNT, bPNT...)
- 每个代币可配置不同的Settlement合约
- 支持exchangeRate (用于多代币汇率转换)

### 3. 简单管理
- Factory追踪所有已部署代币
- 可按symbol查询代币地址
- Owner可mint代币给用户

## 合约架构

```
GasTokenFactory (工厂)
  ├─ createToken() → 部署新的GasToken
  ├─ getTokenBySymbol() → 查询已部署代币
  └─ getTokenInfo() → 获取代币信息

GasToken (代币合约)
  ├─ settlement (immutable) → 绑定的Settlement合约
  ├─ exchangeRate → 汇率 (相对于基础PNT)
  ├─ mint() → 铸币 (自动授权Settlement)
  ├─ approve() → 重写,防止撤销Settlement授权
  └─ _update() → 转账时自动授权新接收者
```

## 部署流程

### 1. 环境配置

```bash
# .env
SETTLEMENT_ADDRESS=0x6Bbf0C72805ECd4305EfCCF579c32d6F6d3041d5
PRIVATE_KEY=0x...
OPTIMISM_RPC_URL=https://mainnet.optimism.io
```

### 2. 部署Factory和基础PNT

```bash
cd contracts
forge script script/DeployGasToken.s.sol:DeployGasToken \
  --rpc-url $OPTIMISM_RPC_URL \
  --broadcast \
  --verify
```

### 3. 部署其他PNT变种

```solidity
// 通过Factory部署aPNT (项目A的积分)
address aPNT = factory.createToken(
    "A Project Points",
    "aPNT",
    settlement,           // 可以是相同或不同的Settlement
    1.2e18               // 1 aPNT = 1.2 PNT
);
```

## 使用示例

### Owner铸币

```solidity
GasToken pnt = GasToken(pntAddress);

// 给用户铸造100 PNT
pnt.mint(user, 100e18);

// 用户自动获得对Settlement的授权
// pnt.allowance(user, settlement) == type(uint256).max
```

### Settlement扣款

```solidity
// Settlement合约可以直接transferFrom
// 无需用户approve (已自动授权)
pnt.transferFrom(user, treasury, 5e18);
```

### 查询代币信息

```solidity
// 通过Factory查询
address pntAddr = factory.getTokenBySymbol("PNT");

// 获取代币详情
(
    string memory name,
    string memory symbol,
    address settlement,
    uint256 exchangeRate,
    uint256 totalSupply
) = factory.getTokenInfo(pntAddr);
```

## 安全机制

### 1. 防止撤销授权

```solidity
// ❌ 用户尝试撤销授权会失败
pnt.approve(settlement, 0);
// Revert: "GasToken: cannot revoke settlement approval"

// ✅ 用户可以授权其他地址
pnt.approve(otherAddress, 100e18);  // OK
```

### 2. 自动维护授权

```solidity
// 用户A转账给用户B
pnt.transfer(userB, 50e18);

// userB自动获得授权
assert(pnt.allowance(userB, settlement) == type(uint256).max);
```

### 3. Immutable Settlement

```solidity
// Settlement地址在部署时设置,不可更改
address public immutable settlement;
```

## 测试

```bash
# 运行所有测试
forge test --match-path test/GasToken.t.sol -vv

# 测试覆盖:
# ✅ 部署和初始化
# ✅ 铸币自动授权
# ✅ 转账维护授权
# ✅ 防止撤销授权
# ✅ Settlement可以transferFrom
# ✅ exchangeRate管理
# ✅ Factory追踪和查询
```

## 多代币场景

### 场景1: 不同项目的积分

```solidity
// 项目A发行aPNT (汇率1.2,更值钱)
address aPNT = factory.createToken("A Points", "aPNT", settlement, 1.2e18);

// 项目B发行bPNT (汇率0.8,便宜)
address bPNT = factory.createToken("B Points", "bPNT", settlement, 0.8e18);

// 用户可以用任何PNT支付gas
// Keeper根据exchangeRate计算应扣数量
```

### 场景2: 不同Settlement合约

```solidity
// L1的Settlement
address settlementL1 = 0x123...;
address pntL1 = factory.createToken("PNT L1", "PNT1", settlementL1, 1e18);

// L2的Settlement
address settlementL2 = 0x456...;
address pntL2 = factory.createToken("PNT L2", "PNT2", settlementL2, 1e18);
```

## ExchangeRate说明

exchangeRate表示该代币相对于基础PNT的汇率:

```
exchangeRate = 1e18  → 1:1 (基础PNT)
exchangeRate = 1.2e18 → 1 token = 1.2 base PNT (更贵)
exchangeRate = 0.8e18 → 1 token = 0.8 base PNT (便宜)

计算示例:
Gas成本: 5 base PNT
用户使用aPNT支付 (rate=1.2):
应扣aPNT = 5 / 1.2 = 4.17 aPNT
```

## 与UniswapV4集成 (未来)

```javascript
// Keeper可以从Uniswap获取实时汇率
const pool = new ethers.Contract(uniswapPoolAddress, poolABI);
const realTimeRate = await pool.slot0();

// 计算实时应扣数量
const tokenAmount = basePNT * realTimeRate / 1e18;
```

## Gas优化

- ✅ Settlement地址immutable (节省SLOAD)
- ✅ 预授权MAX_UINT256 (无需多次approve)
- ✅ Factory使用mapping查询 (O(1))

## 升级路径

当前版本: v1 (不可升级)

未来可以:
1. 使用Proxy模式实现可升级
2. 添加更多授权验证规则
3. 集成价格预言机

## 常见问题

### Q: 用户如何获得PNT?
A: Owner调用`mint()`函数铸造给用户,或用户从市场购买。

### Q: 如果用户想取消授权怎么办?
A: 无法取消Settlement的授权,这是设计特性,防止逃避gas付费。

### Q: 多个Settlement怎么办?
A: 每个GasToken绑定一个Settlement合约。如需支持多个,可部署多个GasToken实例。

### Q: exchangeRate可以修改吗?
A: 可以,Owner可以调用`setExchangeRate()`更新。

## 已部署合约 (待填写)

```
Network: Optimism Mainnet

GasTokenFactory: 0x...
PNT Token: 0x...
Settlement: 0x6Bbf0C72805ECd4305EfCCF579c32d6F6d3041d5
```

## 许可证

MIT
