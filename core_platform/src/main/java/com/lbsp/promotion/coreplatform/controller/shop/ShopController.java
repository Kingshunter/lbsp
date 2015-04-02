package com.lbsp.promotion.coreplatform.controller.shop;

import com.lbsp.promotion.core.service.shop.ShopService;
import com.lbsp.promotion.coreplatform.controller.base.BaseUploadController;
import com.lbsp.promotion.entity.base.PageResultRsp;
import com.lbsp.promotion.entity.constants.GenericConstants;
import com.lbsp.promotion.entity.model.Shop;
import com.lbsp.promotion.entity.response.ShopRsp;
import com.lbsp.promotion.util.validation.Validation;
import org.apache.commons.lang.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 *
 * Created on 2015-04-01 09:20:42
 *
 * @author 简易自动代码创建工具
 */
@Controller
@RequestMapping("/shop")
public class ShopController extends BaseUploadController {


	@Autowired
	private ShopService<Shop> service;

    @Value("${fileupload.path}")
    private String resourceRootPath;
    @Value("${fileupload.src.path}")
    private String resourceSrcPath;
    @Value("${fileupload.shop.pic.dir}")
    private String logoDirPath;
    @Value("${fileupload.shop.sell.dir}")
    private String sellDirPath;

    private Map map = new HashMap();

	/**
	 *
	 * 通过ID获取信息
	 *
	 * @param id
	 * @return 
	 */
	@RequestMapping(value = "/{id}", method = RequestMethod.GET)
	@ResponseBody
	public Object detail(@PathVariable(value = "id") Integer id) {
		ShopRsp rsp = service.getDetailById(id);
		return this.createBaseResult("query success", rsp);
	}

    /**
     * 上传用户图像
     *
     * @return
     */
    @RequestMapping(value = "/upload", method = RequestMethod.POST)
    @ResponseBody
    public Object uploadFile(HttpServletRequest request,
                             @RequestParam(value = "uploadFile",required = false) MultipartFile file,
                             @RequestParam(value = "type",required = false) String type){
        String filename = "";
        String resourceRootDir = null;
        if ("logo".equals(type)){
            map.put("key","logo_path");
            resourceRootDir=logoDirPath;
        }else{
            map.put("key","sell_path");
            resourceRootDir=sellDirPath;
        }

        try {
            filename = upload(file,resourceRootPath,resourceRootDir,resourceSrcPath);
        } catch (Exception e) {
            e.printStackTrace();
        }

        map.put("val",filename);
        return this.createBaseResult("query success", map);
    }

	/**
	 *
	 * 获取信息集合(分页)
	 *
	 * @param startRecord
	 * @param maxRecords
	 * @param from
	 * @param to
	 * @return 
	 */
	@RequestMapping(value = "/lst", method = RequestMethod.GET)
	@ResponseBody
	public Object list(@RequestParam(value = "iDisplayStart", required=false,defaultValue=DEFAULT_LIST_PAGE_INDEX) Integer startRecord,
						@RequestParam(value = "iDisplayLength", required=false,defaultValue=DEFAULT_LIST_PAGE_SIZE) Integer maxRecords,
                        @RequestParam(value = "sell", required=false) String sell,
                        @RequestParam(value = "name", required=false) String name,
                        @RequestParam(value = "address", required=false) String address,
                        @RequestParam(value = "status", required=false) Integer status,
                        @RequestParam(value = "user", required=false) String user,
                        @RequestParam(value = "from", required=false) Long from,
						@RequestParam(value = "to", required=false) Long to) {

		if (Validation.isEmpty(startRecord) || startRecord < GenericConstants.DEFAULT_LIST_PAGE_INDEX)
			startRecord = GenericConstants.DEFAULT_LIST_PAGE_INDEX;
		if (Validation.isEmpty(maxRecords) || maxRecords < 1)
			maxRecords = GenericConstants.DEFAULT_LIST_PAGE_SIZE;
		if (maxRecords > GenericConstants.DEFAULT_LIST_PAGE_MAX_SIZE)
			maxRecords = GenericConstants.DEFAULT_LIST_PAGE_MAX_SIZE;

		PageResultRsp page = service.getPageList(user,sell,name,address,status,from,to,startRecord,maxRecords);
		return this.createBaseResult("query success", page.getResult(),page.getPageInfo());
	}

	/**
	 *
	 * 保存信息
	 *
	 * @param request
	 * @param obj
	 * @return 
	 */
	@RequestMapping(value = "/add", method = RequestMethod.POST)
	@ResponseBody
	public Object save(HttpServletRequest request, @RequestBody Shop obj) {
		setCommonInfo(obj,request);
		if(service.saveShop(obj)){
			return this.createBaseResult("add success", true);
		}else{
			return this.createBaseResult("add failure", false);
		}
	}

	/**
	 *
	 * 更新信息
	 *
	 * @param request
	 * @param obj
	 * @return 
	 */
	@RequestMapping(value = "/upt", method = RequestMethod.PUT)
	@ResponseBody
	public Object update(HttpServletRequest request, @RequestBody Shop obj) {
		setCommonInfo(obj,request);
		if(service.updateShop(obj)){
			return this.createBaseResult("update success", true);
		}else{
			return this.createBaseResult("update failure", false);
		}
	}

	/**
	 *
	 * 删除信息
	 *
	 * @param ids
	 * @return 
	 */
	@RequestMapping(value = "/del", method = RequestMethod.DELETE)
	@ResponseBody
	public Object delete(@RequestParam("ids")String ids) {
		String[] idStr = ids.split(",");
		boolean flag = false;
		if(idStr.length == 1 && StringUtils.isNumeric(ids)){
			flag = service.deleteShop(Integer.parseInt(ids));
		}else{
			List<Integer> idAry = new ArrayList<Integer>();
			for (String id : idStr){
				if(StringUtils.isNumeric(id)){
					idAry.add(Integer.valueOf(id));
				}
			}
			flag = service.batchDeleteShop(idAry);
		}
		if(flag){
			return this.createBaseResult("delete success", true);
		}else{
			return this.createBaseResult("delete failure", false);
		}
	}

}
